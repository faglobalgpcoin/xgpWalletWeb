import { observable, action } from 'mobx';

export default class SnackbarStore {
  @observable isActive = false;
  @observable message = '';

  @action handleClick = (bool) => {
    this.isActive = bool;
  };

  @action activeSnackbar = (message) => {
    this.message = message;
    this.isActive = true;
  };
}
