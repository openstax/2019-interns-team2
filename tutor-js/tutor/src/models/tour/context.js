import {
  BaseModel, identifiedBy, computed, observable, field,
} from 'shared/model';
import {
  find, isEmpty, intersection, compact, uniq, flatMap, map, get,
  filter, delay, forEach, flatten, first,
} from 'lodash';
import { observe, action } from 'mobx';

import Courses   from '../courses-map';
import User      from '../user';
import Tour      from '../tour';
import TourRide  from './ride';

// TourContext
// Created by the upper-most React element (the Conductor)
// Regions and Anchors check in and out as they're mounted/unmounted

export default
@identifiedBy('tour/context')
class TourContext extends BaseModel {

  @observable regions = observable.array([], { deep: false });
  @observable anchors = observable.map({}, { deep: false });

  @field isEnabled = true;

  @field emitDebugInfo = false;

  @field autoRemind = true;

  @observable forcePastToursIndication;

  @observable otherModal;

  constructor(attrs) {
    super(attrs);
    observe(this, 'tourRide', this._onTourRideChange.bind(this));
  }

  @computed get tourIds() {
    if (this.isEnabled && !get(this, 'otherModal.isDisplaying', false)) {
      return compact(uniq(flatMap(this.regions, r => r.tour_ids)));
    } else {
      return [];
    }
  }

  @computed get courseIds() {
    return compact(uniq(map(this.regions, 'courseId')));
  }

  @computed get courses() {
    return compact(this.courseIds.map(id => Courses.get(id)));
  }

  addAnchor(id, domEl) {
    this.anchors.set(id, domEl);
  }

  removeAnchor(id) {
    this.anchors.delete(id);
  }

  openRegion(region) {
    const existing = find(this.regions, { id: region.id });
    if (!existing){
      this.regions.push(region);
      this.checkReminders(region);
    }
  }

  closeRegion(region) {
    forEach(this.allTours, (tour) => {
      tour.justViewed = false;
    });
    this.regions.remove(region);
  }

  checkReminders(region) {
    const checkRegion = region || first(this.regions);
    const remindersTourId = 'page-tips-reminders';
    if ( checkRegion && this.autoRemind && !this.tour &&
      this.needsPageTipsReminders && !this.tourIds.includes(remindersTourId)
    ) {
      delay(() => checkRegion.otherTours.push(remindersTourId), 500);
    }
  }

  @computed get activeRegion() {
    if (!this.tour){ return null; }
    return this.regions.find(region => region.tour_ids.find(tid => tid === this.tour.id));
  }

  // The tour that should be shown
  @computed get tour() {
    // do not interfere with terms agreement
    if (!isEmpty(this.courses) && User.terms_signatures_needed) { return null; }
    return find(this.eligibleTours, 'isViewable') || null;
  }

  @computed get tourRide() {
    const { tour } = this;
    if ( tour ) {
      return new TourRide({ tour, context: this, region: this.activeRegion });
    }
    return null;
  }

  @computed get audienceTags() {
    if (isEmpty(this.courses)) {
      return User.tourAudienceTags;
    }
    return uniq(flatMap(this.courses, c => c.tourAudienceTags));
  }

  @computed get toursTags() {
    return flatMap(this.allTours, t => t.audience_tags);
  }

  @computed get allTours() {
    return compact(uniq(
      flatten(this.tourIds.map(id =>
        this.courseIds.map(courseId => Tour.forIdentifier(id, { courseId }))
      )).concat(
        this.tourIds.map(id => Tour.forIdentifier(id, {}))
      )
    ));
  }

  @computed get eligibleTours() {
    return filter(this.allTours, (tour) => (!isEmpty(intersection(tour.audience_tags, this.audienceTags))));
  }

  @computed get needsPageTipsReminders() {
    return this.hasTriggeredTour && !find(this.eligibleTours, (tour) => tour.autoplay && !tour.perCourse);
  }

  @computed get hasTriggeredTour() {
    return !!find(this.allTours, (tour) =>
      !(tour.autoplay || isEmpty(intersection(tour.audience_tags, this.audienceTags)))
    );
  }

  @computed get debugStatus() {
    return `available regions: [${map(this.regions, 'id')}]; region tour ids: [${this.tourIds}]; audience tags: [${this.audienceTags}]; tour tags: [${this.toursTags}]; eligible tours: [${map(this.eligibleTours,'id')}]; TOUR RIDE: ${this.tourRide ? this.tourRide.tour.id : '<none>'}`;
  }

  @action playTriggeredTours() {
    this.eligibleTours.forEach((tour) => {
      if (!tour.autoplay){ tour.play(); }
    });
  }

  _onTourRideChange({ type, oldValue: oldRide }) {
    this.checkReminders();
    if (type !== 'update') { return; }
    if (oldRide) { oldRide.dispose(); }
  }

};
