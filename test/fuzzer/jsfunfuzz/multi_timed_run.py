#!/usr/bin/env python

# multi_timed_run.py by jesse ruderman
# based on timed_run.py by coop and bob clary

# Usage: multi_timed_run timeout command args

# e.g.   multi_timed_run 240 ./js ~/Desktop/fuzz/jsfunfuzz/jsfunfuzz.js
# will run "./js ~/Desktop/fuzz/jsfunfuzz/jsfunfuzz.js" over and over, each time limiting
# it to executing for 240 seconds.  This makes it possible for the fuzzer to run unattended
# (even overnight) -- when you come back, you'll see all the bugs it found.

# If jsfunfuzz.js finishes all of its iterations, multi_timed_run.py will just print "NORMAL", not showing
# any of the log.  If it doesn't finish, multi_timed_run.py will show the last 20 lines of the log.

# How to interpret various outputs:
#   NORMAL *with output* -- usually indicates that the fuzzer made the javascript engine halt execution (out of memory?)
#   CRASHED              -- on Mac OS X, use Console.app to view ~/Library/Logs/CrashReporter/js.log to see the stack
#   TIMED OUT            -- hang or very slow loop
#   ABNORMAL             -- a fuzzer-generated function did something that let to a TypeError in the fuzzer itself


exitOSError   = 66
exitInterrupt = 99


import os, signal, sys, time

pid = None


def alarm_handler(signum, frame):
    global pid
    print "TIMED OUT!"
    try:
        os.kill(pid, signal.SIGKILL)
    except:
        pass

def forkexec(command, args, stdoutfn):
    try:
        pid = os.fork()
        if pid == 0:  # Child

            # redirect stdout (just for the child!).
            # i hope i'm not supposed to close() this file somehow...
            so = file(stdoutfn, 'w')
            os.dup2(so.fileno(), sys.stdout.fileno())

            # redirect stderr too (to a separate file, for now)
            so = file("err-" + stdoutfn, 'w')
            os.dup2(so.fileno(), sys.stderr.fileno())
            
            # transfer control of the child to the target program
            os.execvp(command, args)
             
        else:  # Parent
            return pid
    except OSError, e:
        print "ERROR: %s %s failed: %d (%s)" % (command, args, e.errno, e.strerror)
        sys.exit(exitOSError)

def one_timed_run(logfilename):
    global pid

    signal.signal(signal.SIGALRM, alarm_handler)
    signal.alarm(int(sys.argv[1]))

    starttime = time.time()

    msg = ''

    try:
      pid = forkexec(sys.argv[2], sys.argv[2:], logfilename)

      try: 
        status = os.waitpid(pid, 0)[1]
      except OSError:
        msg = 'TIMED OUT' # assume this means it timed out
      
      signal.alarm(0) # Cancel the alarm

    except KeyboardInterrupt:
      print "Bye!"
      try:
        os.kill(pid, 9)
      except OSError, e:
        print "Unable to kill it: %s" % e
      sys.exit(exitInterrupt)

    stoptime = time.time()
    elapsedtime = stoptime - starttime
    
    if (msg == 'TIMED OUT'):
        pass
    elif os.WIFEXITED(status):
        rc = os.WEXITSTATUS(status)
        if rc == 0:
            msg = 'NORMAL'
        else:
            # the original timed_run.py considered rc >= 3 to be a crash. why?
            msg = 'ABNORMAL ' + str(rc)
    elif os.WIFSIGNALED(status):
        print time.asctime()
        msg = 'CRASHED signal %d' % os.WTERMSIG(status)
    else:
        msg = 'NONE'

    print "EXIT STATUS: %s (%f seconds) (log file %s)" % (msg, elapsedtime, logfilename)

def succeeded(logfilename):
    logfile = open(logfilename, "r")
    for line in logfile:
        if (line == "It's looking good!\n"):
            return True
    return False

def showtail(logfilename):
    cmd = "tail -n 20 %s" % logfilename
    print cmd
    print ""
    os.system(cmd)
    print ""
    print ""

def many_timed_runs():
    iteration = 0
    while True:
        iteration += 1
        logfilename = "w%d" % iteration
        one_timed_run(logfilename)
        if not succeeded(logfilename):
             showtail(logfilename)
             showtail("err-" + logfilename)

many_timed_runs()
