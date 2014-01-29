macro m {
  case { _ } => {
    require("./module");
    return [];
  }
}

export m;
