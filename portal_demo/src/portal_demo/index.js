//var physiomeportal = require("portal_demo/physiomeportal");

var main = function()  {
  var moduleManager = undefined;
  var UIIsReady = true;
  var managerSidebar = undefined;
  var _this = this;

  /**
   * Initialise all the panels required for PJP to function correctly.
   * Modules used incude - {@link PJP.ModelsLoader}, {@link PJP.BodyViewer},
   * {@link PJP.OrgansViewer}, {@link PJP.TissueViewer}, {@link PJP.CellPanel}
   * and {@link PJP.ModelPanel}.
   */
  var initialiseMain = function() {
    if (moduleManager.isReady()) {
      var scaffoldViewer = moduleManager.createModule("Scaffold Viewer");
      var scaffoldDialog = new physiomeportal.ScaffoldDialog(scaffoldViewer);
      scaffoldViewer.setName("Scaffold Viewer");
      scaffoldDialog.setLeft("12%");
      scaffoldDialog.setWidth("88%");
      scaffoldDialog.setHeight("99%");
      scaffoldDialog.destroyModuleOnClose = true;
      managerSidebar = new physiomeportal.ManagerSidebar(
          document.getElementsByTagName("BODY")[0]);
      moduleManager.manageDialog(scaffoldDialog);
      managerSidebar.addManager(moduleManager);
      managerSidebar.close();
      managerSidebar.setWidth("12%");
      UIIsReady = true;
    } else {
      setTimeout(function(){initialiseMain()}, 1000);
    }
  }
    
  var initialise = function() {
    moduleManager = new physiomeportal.ModuleManager();
    initialiseMain();
  }

  initialise();
}

window.document.addEventListener('DOMContentLoaded', main);