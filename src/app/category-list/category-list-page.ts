import {Component, Inject} from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    CorReleationDataType,
    Environment,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import {Router} from '@angular/router';
import {ContentService, ContentsGroupedByPageSection, CourseService, FormService, ProfileService, SearchType} from 'sunbird-sdk';
import {ContentAggregation} from 'sunbird-sdk/content/handlers/content-aggregator';
import {ContentData, ContentSearchCriteria} from 'sunbird-sdk/content';
import {ContentUtil} from '@app/util/content-util';
import {RouterLinks} from '@app/app/app.constant';
import {NavigationService} from '@app/services/navigation-handler.service';
import {ScrollToService} from '@app/services/scroll-to.service';


@Component({
    selector: 'app-home-page',
    templateUrl: './category-list-page.html',
    styleUrls: ['./category-list-page.scss'],
})

export class CategoryListPage {

    sectionGroup?: ContentsGroupedByPageSection;
    formField: {
        facet: string;
        searchCriteria: ContentSearchCriteria;
        aggregate: {
            sortBy?: {
                [field in keyof ContentData]: 'asc' | 'desc';
            }[];
            groupBy?: keyof ContentData;
        };
    };
    public imageSrcMap = new Map();
    defaultImg: string;
    showSheenAnimation = true;

    constructor(
        public commonUtilService: CommonUtilService,
        private router: Router,
        private appHeaderService: AppHeaderService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private navService: NavigationService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private scrollService: ScrollToService
    ) {
        const extrasState = this.router.getCurrentNavigation().extras.state;
        if (extrasState) {
            this.formField = extrasState.formField;
            this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        }
    }

    ionViewWillEnter() {
        this.appHeaderService.showHeaderWithBackButton();
        this.fetchAndSortData();
    }

    private async fetchAndSortData() {
        this.sectionGroup = ((await this.contentService.buildContentAggregator
        (this.formService, this.courseService, this.profileService)
            .aggregate({
                    interceptSearchCriteria: () => ({
                        ...this.formField.searchCriteria,
                        searchType: SearchType.SEARCH,
                        limit: 100
                    })
                },
                [], null, [{
                    index: 0,
                    title: this.formField.facet,
                    isEnabled: true,
                    dataSrc: {
                        name: 'CONTENTS',
                        aggregate: this.formField.aggregate,
                        search: {
                            filters: {}
                        },
                    },
                    theme: {}
                }]).toPromise()).result[0] as ContentAggregation<'CONTENTS'>).data;
        this.showSheenAnimation = false;
    }

    navigateToTextbookPage(items, subject) {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(items));
        if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {

            this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: items,
                    subjectName: subject
                }
            });
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1').then();
        }
    }

    navigateToDetailPage(event, sectionName) {
        event.data = event.data.content ? event.data.content : event.data;
        const item = event.data;
        const index = event.index;
        const identifier = item.contentId || item.identifier;
        const corRelationList = [{id: sectionName || '', type: CorReleationDataType.SECTION}];
        const values = {};
        values['sectionName'] = sectionName;
        values['positionClicked'] = index;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(item),
            values,
            ContentUtil.generateRollUp(undefined, identifier),
            corRelationList);
        if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
            this.navService.navigateToDetailPage(item, {content: item, corRelation: corRelationList});
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1').then();
        }
    }

    scrollToSection(id: string) {
        this.scrollService.scrollTo(id);
    }

    valueChanged(event) {

    }

    statusChanged(event) {

    }
}
