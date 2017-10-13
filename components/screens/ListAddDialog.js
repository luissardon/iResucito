import React from 'react';
import { connect } from 'react-redux';
import { Text, Input, Item, Label } from 'native-base';
import {
  SET_LIST_ADD_VISIBLE,
  LIST_CREATE,
  LIST_CREATE_NAME
} from '../actions';
import BaseModal from './BaseModal';

class ListAddDialog extends React.Component {
  constructor(props) {
    super(props);
    this.focusInput = this.focusInput.bind(this);
  }

  focusInput() {
    this.listNameInput._root.focus();
  }

  render() {
    if (!this.props.listCreateEnabled) {
      var disabledReasonText =
        this.props.listCreateName && this.props.listCreateName.trim() !== ''
          ? 'Ya existe una lista con el mismo nombre'
          : 'Ingrese un nombre no vacío';
    }
    return (
      <BaseModal
        visible={this.props.visible}
        modalShow={() => this.focusInput()}
        closeModal={() => this.props.closeListAdd()}
        acceptModal={() => this.props.createNewList(this.props.listCreateName)}
        acceptDisabled={!this.props.listCreateEnabled}
        acceptText="Agregar"
        title="Crear Lista">
        <Item
          style={{ marginBottom: 20 }}
          floatingLabel
          error={!this.props.listCreateEnabled}
          success={this.props.listCreateEnabled}>
          <Label>Nombre</Label>
          <Input
            getRef={input => {
              this.listNameInput = input;
            }}
            onChangeText={text => this.props.updateNewListName(text)}
            value={this.props.listCreateName}
            clearButtonMode="always"
            autoCorrect={false}
          />
        </Item>
        <Text danger note>
          {disabledReasonText}
        </Text>
      </BaseModal>
    );
  }
}

const mapStateToProps = state => {
  var visible = state.ui.get('list_add_visible');
  var list_create_name = state.ui.get('list_create_name');
  var list_create_enabled = state.ui.get('list_create_enabled');
  return {
    visible: visible,
    listCreateName: list_create_name,
    listCreateEnabled: list_create_enabled
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeListAdd: () => {
      dispatch({ type: SET_LIST_ADD_VISIBLE, visible: false });
    },
    updateNewListName: text => {
      dispatch({ type: LIST_CREATE_NAME, name: text });
    },
    createNewList: name => {
      dispatch({ type: LIST_CREATE, name: name });
      dispatch({ type: SET_LIST_ADD_VISIBLE, visible: false });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListAddDialog);
