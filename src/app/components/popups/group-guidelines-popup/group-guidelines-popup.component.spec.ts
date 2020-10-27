import { Events, PopoverController, Platform } from '@ionic/angular';
import { GroupGuideLinesPopoverComponent } from './group-guidelines-popup.component';
import { CommonUtilService, UtilityService } from '@app/services';

describe('SbGenericPopoverComponent', () => {
    let groupGuideLinesPopoverComponent: GroupGuideLinesPopoverComponent;

    const mockCommonUtilService: Partial<CommonUtilService> = {
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {};
    const mockUtilityService: Partial<UtilityService> = {};

    beforeAll(() => {
        groupGuideLinesPopoverComponent = new GroupGuideLinesPopoverComponent(
            mockPopOverController as PopoverController,
            mockPlatform as Platform,
            mockUtilityService as UtilityService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbGenericPopoverComponent', () => {
        expect(groupGuideLinesPopoverComponent).toBeTruthy();
    });

    it('should subscribe to back button and events subscription', (done) => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        groupGuideLinesPopoverComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => 'sunbird');
        // act
        groupGuideLinesPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
            expect(unsubscribeFn).toHaveBeenCalled();
            done();
        });
    });

    it('should unsubscribe to back button and events on ngOnDestroy', () => {
        // arrange
        groupGuideLinesPopoverComponent.backButtonFunc = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        groupGuideLinesPopoverComponent.ngOnDestroy();
        // assert
        // expect(groupGuideLinesPopoverComponent.selectedContents).toEqual(mockEventsResponse);
        expect(groupGuideLinesPopoverComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should dismiss the popup on closePopOver', () => {
        // arrange
        // act
        groupGuideLinesPopoverComponent.closePopover();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
    });

    it('should dismiss the popup on continue if agreedToGroupGuidelines', () => {
        // arrange
        groupGuideLinesPopoverComponent.agreedToGroupGuidelines = true;
        // act
        groupGuideLinesPopoverComponent.continue();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: true });
    });

    it('should dismiss the popup on continue if not agreedToGroupGuidelines', () => {
        // arrange
        groupGuideLinesPopoverComponent.agreedToGroupGuidelines = false;
        // act
        groupGuideLinesPopoverComponent.continue();
        // assert
        expect(groupGuideLinesPopoverComponent.showGroupGuideLinesError).toBe(true);
    });

});
