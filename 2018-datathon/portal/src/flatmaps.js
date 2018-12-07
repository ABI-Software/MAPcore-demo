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
  var UIIsReady = true;
  var _this = this;
  var moduleManager = undefined;
  /**
   * Initialise all the panels required for PJP to function correctly.
   * Modules used incude - {@link PJP.ModelsLoader}, {@link PJP.BodyViewer},
   * {@link PJP.OrgansViewer}, {@link PJP.TissueViewer}, {@link PJP.CellPanel}
   * and {@link PJP.ModelPanel}.
   */
  var initialiseMain = function() {
    if (moduleManager.isReady()) {
      var modelPanel = moduleManager.createModule("Model Panel");
      var organsViewer = moduleManager.createModule("Organs Viewer");
      modelPanel.setName("Model Panel");
      organsViewer.setName("Organs Viewer");
      var organsViewerDialog = moduleManager.createDialog(organsViewer);
      var modelPanelDialog = moduleManager.createDialog(modelPanel);
      modelPanelDialog.setWidth("50%");
      modelPanelDialog.setHeight("100%");
      modelPanelDialog.setLeft("0%");
      organsViewerDialog.setWidth("50%");
      organsViewerDialog.setHeight("100%");
      organsViewerDialog.setLeft("50%");
      modelPanelDialog.destroyModuleOnClose = true;
      organsViewerDialog.destroyModuleOnClose = true;
      moduleManager.manageDialog(modelPanelDialog);
      moduleManager.manageDialog(organsViewerDialog);
      modelPanel.openModel("respiratory-control-background.svg");
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
