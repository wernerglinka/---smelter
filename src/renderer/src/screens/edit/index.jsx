import { Link } from 'react-router-dom';
import { SidebarHideIcon, PreviewShowIcon } from '../../components/icons';
import { Button, PageTitle } from '../../styles/common';
import { TitleBar } from '../../styles/common';
import { useProject } from '../../hooks/useProject';
import {
  EditContainer,
  MainContent
} from './styles';

export default function EditPage() {
  const { projectName } = useProject();

  return (
    <>
      <TitleBar />
      <h1 id="project-name">
        {projectName}
        <Link className="btn" to="/">Start Over</Link>
      </h1>

      <div className="js-view-sidebar">
        <a className="js-sidebar-toggle sidebar-toggle">
          <SidebarHideIcon />
        </a>
      </div>

      <div className="edit-pane js-edit-pane">
        <div className="js-sidebar sidebar">
          <div className="sidebar-container container-background">
            <ul className="sidebar-pane-selection js-sidebar-pane-selection">
              <li className="select-file">
                <a className="active btn" data-pane="js-select-file">Select File</a>
              </li>
              <li className="select-file">
                <a id="init-new-page" className="btn">Build New Page</a>
              </li>
              <li className="add-field">
                <a className="btn" data-pane="js-add-field">Add Field</a>
              </li>
              <li className="add-component">
                <a className="btn" data-pane="js-add-template">Add Template</a>
              </li>
            </ul>
          </div>

          <div className="sidebar-panes">
            <div id="js-add-field" className="sidebar-pane js-sidebar-pane">
              <div className="sidebar-hint container-background">
                <p>Drag a field into the editor...</p>
              </div>
            </div>

            <div id="js-select-file" className="sidebar-pane js-sidebar-pane active">
              <div className="sidebar-hint container-background">
                <p>Select a project file to start editing...</p>
              </div>
              <div className="js-dom-tree-wrapper container-background">
                <h3>Project Files</h3>
              </div>
            </div>

            <div id="js-add-template" className="sidebar-pane js-sidebar-pane">
              <div className="sidebar-hint container-background">
                <p>Drag a template into the editor...</p>
              </div>
              <div className="js-templates-wrapper container-background">
                <h3>Page Templates</h3>
              </div>
            </div>
          </div>
        </div>

        <main className="js-edit-container edit-container container-background">
          <h2 id="file-name">
            <span></span>
            <button id="preview-button" className="btn" title="Open preview pane">
              <PreviewShowIcon />
            </button>
          </h2>
          <div id="content-container"></div>
        </main>

        <div className="js-right-sidebar right-sidebar">
          <div className="preview-pane container-background js-preview-pane"></div>
        </div>
      </div>
    </>
  );
}
