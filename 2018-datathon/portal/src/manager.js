/**
 * Main loop to start loading the Physiome Journal Portal page,
 * it currenrly contains 5 panels containly a module each 
 * in the following layout.
 * 
 * <pre>
 * -------------------------
 * |     |     |     |     |
 * |     |     |  C  |     |
 * |  A  |  B  |-----|  E  |
 * |     |     |  D  |     |
 * |     |     |     |     |
 * -------------------------
 * 
 * A: {@link PJP.BodyViewer}
 * B: {@link PJP.OrgansViewer}
 * C: {@link PJP.TissueViewer}
 * D: {@link PJP.CellPanel}
 * E: {@link PJP.ModelPanel}
 * </pre> 
 * 
 * Currently the main and each of the panel layouts are loaded into the page
 * using link element imports. 
 * This portal currently allows users to view from the 3D anatomy models to the
 * cell models of different parts of the bodies in selected species.
 * More functionalities will be implemented soon including annotations of models,
 * mesh refinement and many more.  
 * 
 * @class
 * @author Alan Wu
 * @returns {PJP.Main}
 */
Main = function()  {
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
      var bodyViewer = moduleManager.createModule("Body Viewer");
      var organsViewer = moduleManager.createModule("Organs Viewer");
      organsViewer.setName("Organs Viewer");
      var organsViewerDialog = new physiomeportal.OrgansViewerDialog(organsViewer);
      bodyViewer.setName("Body Viewer");
      managerSidebar = new physiomeportal.ManagerSidebar(
          document.getElementsByTagName("BODY")[0]);
      bodyViewer.readSystemMeta();
      var bodyViewerDialog = new physiomeportal.BodyViewerDialog(bodyViewer);
      bodyViewerDialog.setWidth("44%");
      bodyViewerDialog.setHeight("100%");
      bodyViewerDialog.setLeft("12%");
      bodyViewerDialog.setTop("0px");
      bodyViewerDialog.destroyModuleOnClose = true;
      organsViewerDialog.setWidth("44%");
      organsViewerDialog.setHeight("100%");
      organsViewerDialog.setLeft("56%");
      organsViewerDialog.setTop("0px");
      organsViewerDialog.destroyModuleOnClose = true;
      organsViewer.loadOrgans("rat", "Digestive", "Stomach");
      moduleManager.manageDialog(bodyViewerDialog);
      moduleManager.manageDialog(organsViewerDialog);
      managerSidebar.addManager(moduleManager);
      managerSidebar.open();
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
