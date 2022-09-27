import {create} from 'mobx-persist';
import AuthStore from './auth';
import SnackbarStore from './snackbar';
import SettingStore from './settingStore';

const authStore = new AuthStore();
const snackbarStore = new SnackbarStore();
const settingStore = new SettingStore();

const hydrate = create({});
hydrate('settingStore', settingStore, () => console.log('setting hydrated'));

export default {
    authStore,
    snackbarStore,
    settingStore,
};
