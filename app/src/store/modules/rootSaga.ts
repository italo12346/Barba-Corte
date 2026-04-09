import {all} from 'redux-saga/effects';
import salao from './salao/sagas';

export default function* rootSaga() {
  yield all([salao()]);
}