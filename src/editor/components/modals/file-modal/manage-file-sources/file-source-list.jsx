import React, { useEffect, useState } from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import CircularProgress from "@material-ui/core/CircularProgress";

import FileSourceListItemDescription from "./file-source-list-item-description";

import DeleteModal from "../../../../../shared/components/delete-modal";

import {
  List,
  ListItem,
  ListMetadata
} from "../../../../../shared/components/list";

import {
  TextButton,
  OutlineButton
} from "../../../../../shared/components/buttons";

import {
  deleteFileSource as deleteFileSourceAction,
  createFileUpdateOperation as createFileUpdateOperationAction,
  getFileSources as getFileSourcesAction
} from "../../../../actions/file-source-actions";

const FileSourceListContainer = styled.div`
  width: 100%;
  margin: auto;
`;

const FileSourceInterval = styled(ListMetadata)`
  font-size: 12px;
  color: gray;
  padding-left: 6px;
  padding-right: 6px;
  margin-left: 4px;
  margin-right: 4px;
`;

const NoFileSourcesNotice = styled.span`
  align-items: center;
  color: #666;
  display: grid;
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
`;

const ListItemCall = styled(ListMetadata)`
  min-width: 100px;
  text-align: center;
  position: relative;
  height: 100%;
  display: grid;
  margin: auto;
  align-content: center;
  overflow: hidden;
  cursor: pointer;
`;

const Fader = styled.div`
  cursor: pointer;
  position: absolute;
  width: 100%;
  height: 100%;
  margin: auto;
  display: grid;
  align-content: center;
  justify-content: center;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: ${({ active }) => (!active ? "translateY(-5px)" : "none")};
  transition: opacity 200ms, transform 250ms;
`;

const FileSourceListUnconnected = ({
  fileSources = [],
  getFileSources,
  deleteFileSource,
  createFileUpdateOperation
}) => {
  // we will handle the delete modal state in a hook.
  // otherwise, the state for the file sources is managed in the
  // store itself.
  const [sourceToDelete, setSourceToDelete] = useState(undefined);
  const [sourceToDeleteFileName, setSourceToDeleteFileName] = useState(
    undefined
  );

  const clearSourceToDelete = () => {
    setSourceToDelete(undefined);
    setSourceToDeleteFileName(undefined);
  };

  useEffect(() => {
    getFileSources();
  }, []);

  return fileSources.length ? (
    <React.Fragment>
      <DeleteModal
        visible={sourceToDelete !== undefined}
        title={`Delete the file source for "${sourceToDeleteFileName}"?`}
        content="This action will not delete any files generated by the file source."
        onCloseOrCancel={clearSourceToDelete}
        deleteFunction={() => deleteFileSource(sourceToDelete)}
        onDelete={clearSourceToDelete}
        aboveOtherModals
      />
      <FileSourceListContainer>
        <List>
          {fileSources.map(fileSource => {
            const {
              id,
              url,
              filename,
              latestFileUpdateOperationStatus,
              hasBeenRun,
              updateInterval,
              lastUpdated,
              isCurrentlyRunning
            } = fileSource;
            return (
              <ListItem type="single" key={fileSource.id}>
                <FileSourceListItemDescription
                  url={url}
                  filename={filename}
                  latestFileUpdateOperationStatus={
                    latestFileUpdateOperationStatus
                  }
                  lastUpdated={lastUpdated}
                  hasBeenRun={hasBeenRun}
                />
                <FileSourceInterval>{updateInterval}</FileSourceInterval>
                <ListItemCall>
                  <Fader active={isCurrentlyRunning}>
                    <CircularProgress size={20} />
                  </Fader>
                  <Fader active={!isCurrentlyRunning}>
                    <OutlineButton
                      disabled={isCurrentlyRunning}
                      onClick={() => {
                        createFileUpdateOperation(id);
                      }}
                    >
                      run now
                    </OutlineButton>
                  </Fader>
                </ListItemCall>
                <ListMetadata>
                  <TextButton
                    onClick={() => {
                      setSourceToDelete(id);
                      setSourceToDeleteFileName(filename);
                    }}
                  >
                    delete
                  </TextButton>
                </ListMetadata>
              </ListItem>
            );
          })}
        </List>
      </FileSourceListContainer>
    </React.Fragment>
  ) : (
    <NoFileSourcesNotice>
      No file sources are associated with this notebook
    </NoFileSourcesNotice>
  );
};

FileSourceListUnconnected.propTypes = {
  fileSources: PropTypes.arrayOf(PropTypes.object),
  getFileSources: PropTypes.func,
  deleteFileSource: PropTypes.func,
  createFileUpdateOperation: PropTypes.func
};

export function mapStateToProps(state) {
  const fileSources = state.fileSources.map(fileSource => {
    return {
      id: fileSource.id,
      filename: fileSource.filename,
      url: fileSource.url,
      updateInterval: fileSource.update_interval,
      isCurrentlyRunning:
        fileSource.latest_file_update_operation &&
        ["pending", "running"].includes(
          fileSource.latest_file_update_operation.status
        ),
      latestFileUpdateOperationStatus:
        fileSource.latest_file_update_operation &&
        fileSource.latest_file_update_operation.status,
      lastUpdated:
        fileSource.latest_file_update_operation &&
        fileSource.latest_file_update_operation.started,
      hasBeenRun:
        fileSource.latest_file_update_operation &&
        fileSource.latest_file_update_operation.status !== undefined &&
        fileSource.latest_file_update_operation.status !== "pending"
    };
  });
  return {
    fileSources
  };
}

export default connect(
  mapStateToProps,
  {
    deleteFileSource: deleteFileSourceAction,
    createFileUpdateOperation: createFileUpdateOperationAction,
    getFileSources: getFileSourcesAction
  }
)(FileSourceListUnconnected);
