import { useState } from 'react';
import { useProject } from './hooks/useProject';
import { useSidebar } from './hooks/useSidebar';
import { SidebarHideIcon } from '../../components/icons';
import { Button, StyledLink, Title } from '../../styles/common';
import { TitleBar } from '../../styles/common';
import {
  EditContainer,
  Sidebar,
  SidebarContainer,
  MainContent,
  PreviewPane
} from './styles';

export default function EditPage() {
  const { projectName, projectPath } = useProject();
  const { isVisible, activePane, toggleSidebar, switchPane } = useSidebar();
  const [selectedFile, setSelectedFile] = useState('');

  return (
    <>
      <TitleBar />
      <Title>
        {projectName}
        <StyledLink to="/">Start Over</StyledLink>
      </Title>

      <EditContainer>
        <Button onClick={toggleSidebar}>
          <SidebarHideIcon />
        </Button>

        <Sidebar hidden={!isVisible}>
          <SidebarContainer>
            <ul>
              <li>
                <Button
                  onClick={() => switchPane('js-select-file')}
                  primary={activePane === 'js-select-file'}
                >
                  Select File
                </Button>
              </li>
              <li>
                <Button
                  id="init-new-page"
                  onClick={() => {/* TODO: Handle new page */}}
                  primary
                >
                  Build New Page
                </Button>
              </li>
              <li>
                <Button
                  onClick={() => switchPane('js-add-field')}
                  primary={activePane === 'js-add-field'}
                >
                  Add Field
                </Button>
              </li>
              <li>
                <Button
                  onClick={() => switchPane('js-add-template')}
                  primary={activePane === 'js-add-template'}
                >
                  Add Template
                </Button>
              </li>
            </ul>
          </SidebarContainer>

          <div className="sidebar-panes">
            <div id="js-add-field" className="sidebar-pane js-sidebar-pane">
              <div className="sidebar-hint container-background">
                <p>Drag a field into the editor...</p>
              </div>
              <div className="container-background">
                <h3>Empty Fields</h3>
                {/* Add field components here */}
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
        </Sidebar>

        <MainContent>
          <h2>{selectedFile}</h2>
          <div id="content-container" />
        </MainContent>

        <PreviewPane />
      </EditContainer>
    </>
  );
}
