import { isEmpty, forIn, isNil } from 'lodash';
import { observable, action } from 'mobx';
import { BootstrapURLs, ExerciseHelpers } from 'shared';
import UiSettings from 'shared/model/ui-settings';
import { startMathJax } from 'shared/helpers/mathjax';
import Notifications from 'shared/model/notifications';
import adapters from '../api/adapter';
import { TransitionAssistant } from '../components/unsaved-state';
import { readBootstrapData } from '../helpers/dom';
import Api from '../api';
import User from './user';
import Raven from './app/raven';
import Courses from './courses-map';
import Payments from './payments';
import FeatureFlags, { FeatureFlagsApi } from './feature_flags';
import Notices from '../helpers/notifications';
import Chat from './chat';
import PulseInsights from './app/pulse-insights';
import Toasts from './toasts';
import Tutor from '../components/root';
import ResponseValidation from './response_validation';

const BOOTSTRAPED_MODELS = {
  user:     User,
  courses:  Courses,
  payments: Payments,
  feature_flags: FeatureFlagsApi,
  response_validation: ResponseValidation,
};

export default class TutorApp {

  @observable tutor_js_url;
  @observable osweb_base_url;

  static rootComponent = Tutor;

  static boot() {
    const app = new TutorApp();
    [Raven, PulseInsights, Api].forEach(lib => lib.boot());

    app.data = readBootstrapData();
    if (isEmpty(app.data)) {
      return app.fetch().then(app.initializeApp);
    }
    return app.initializeApp();
  }

  static logError(error, info) {
    Raven.captureException(error, { extra: info });
  }

  logError(error, info) {
    Raven.captureException(error, { extra: info });
  }

  @action.bound initializeApp() {
    // _MODELS is for adhoc console debugging ONLY, no code should rely on this!
    window._MODELS = {
      settings: UiSettings,
      notifications: Notifications,
      toasts: Toasts,
    };
    window._MODELS.bootstrapData = this.data;
    forIn(BOOTSTRAPED_MODELS, (model, storeId) => {
      const data = this.data[storeId];
      if (data) { model.bootstrap(data); }
      window._MODELS[storeId] = model;
    });
    window._MODELS.feature_flags = FeatureFlags;
    BootstrapURLs.update(this.data);
    UiSettings.initialize(this.data.ui_settings || {});
    Notifications.on('tutor-update', this.onNotice);
    Notices.start(this.data);
    this.osweb_base_url = this.data.osweb_base_url;
    ExerciseHelpers.setOSWebURL(this.osweb_base_url);
    Chat.initialize();
    startMathJax();
    TransitionAssistant.startMonitoring();
    Raven.setUser(User);
    return Promise.resolve(this);
  }

  @action.bound onNotice({ tutor_js_url }) {
    // when it's null, the url should default to the first update
    if (isNil(this.tutor_js_url)) {
      this.tutor_js_url = tutor_js_url;
    } else if (this.tutor_js_url !== tutor_js_url) {
      Toasts.push({ handler: 'reload' });
    }
  }

  fetch() {

  }

  onLoaded({ data }) {
    this.data = data;
  }
}

adapters.connectModelRead(TutorApp, 'fetch', { url: '/bootstrap', onSuccess: 'onLoaded' });