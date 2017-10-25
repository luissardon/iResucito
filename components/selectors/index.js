import { createSelector } from 'reselect';
import { getEsSalmo } from '../util';

const getLists = state => state.ui.get('lists');

export const getProcessedLists = createSelector(getLists, lists => {
  var listNames = lists.keySeq().toArray();
  return listNames.map(name => {
    var listMap = lists.get(name);
    return {
      name: name,
      type: listMap.get('type')
    };
  });
});

const getSalmos = state => {
  return state.ui.get('salmos');
};

const getListFromNavigation = (state, props) => {
  return state.ui.getIn(['lists', props.navigation.state.params.list.name]);
};

export const getSalmosFromList = createSelector(
  getSalmos,
  getListFromNavigation,
  (salmos, listMap) => {
    var result = listMap.map((valor, clave) => {
      if (getEsSalmo(clave) && valor !== null) {
        return salmos.find(s => s.nombre == valor);
      }
      return valor;
    });
    return result;
  }
);

const getContactImportItems = state => state.ui.get('contact_import_items');
const getContacts = state => state.ui.get('contacts');

export const getProcessedContactsForImport = createSelector(
  getContactImportItems,
  getContacts,
  (allContacts, importedContacts) => {
    return allContacts.map(c => {
      var found = importedContacts.find(x => x.recordID === c.recordID);
      c.imported = found !== undefined;
      return c;
    });
  }
);
