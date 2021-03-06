import { expect } from 'chai';
import { NotificationsCenter, Workbench, NotificationType, Notification } from 'vscode-extension-tester';

describe('NotificationsCenter', () => {
    let center: NotificationsCenter;

    before(async () => {
        center = await new Workbench().openNotificationsCenter();
    });
    
    after(async () => {
        await center.close();
    });

    it('getNotifications works', async () => {
        await new Workbench().executeCommand('hello world');
        await center.getDriver().sleep(500);
        center = await new Workbench().openNotificationsCenter();
        const notifications = await center.getNotifications(NotificationType.Any);
        expect(notifications).not.empty;
    });

    it('clearAllNotifications works', async () => {
        await new Workbench().executeCommand('hello world');
        await center.getDriver().sleep(500);
        center = await new Workbench().openNotificationsCenter();
        const notifications = await center.getNotifications(NotificationType.Any);
        expect(notifications).not.empty;

        await center.clearAllNotifications();
        center = await new Workbench().openNotificationsCenter();
        const cleared = await center.getNotifications(NotificationType.Any);
        expect(cleared).empty;
    });

    describe('Notification', () => {
        let notification: Notification;

        before(async () => {
            await new Workbench().executeCommand('hello world');
            await center.getDriver().sleep(200);
            center = await new Workbench().openNotificationsCenter();
            notification = (await center.getNotifications(NotificationType.Any))[0];
        });

        it('getMessage gets the text', async () => {
            const message = await notification.getMessage();
            expect(message).has.string('Hello World');
        });

        it('getType returns notificationYype', async () => {
            const type = await notification.getType();
            expect(type).equals(NotificationType.Info);
        });

        it('hasProgress works', async () => {
            const prog = await notification.hasProgress();
            expect(prog).is.false;
        });

        it('getActions looks for action buttons', async () => {
            const actions = await notification.getActions();
            expect(actions).empty;
        });

        it('getSource returns title of origin', async () => {
            const source = await notification.getSource();
            expect(source).empty;
        });
    });
});