// Import and register all controllers
import { application } from "controllers/application"

import ResponsiveController from "controllers/responsive_controller"
import ModalController from "controllers/modal_controller"
import SidebarController from "controllers/sidebar_controller"
import SearchController from "controllers/search_controller"
import ButtonGroupController from "controllers/button_group_controller"
import CalendarController from "controllers/calendar_controller"
import ChartController from "controllers/chart_controller"
import NotificationsController from "controllers/notifications_controller"
import TagColorController from "controllers/tag_color_controller"

application.register("responsive", ResponsiveController)
application.register("modal", ModalController)
application.register("sidebar", SidebarController)
application.register("search", SearchController)
application.register("button-group", ButtonGroupController)
application.register("calendar", CalendarController)
application.register("chart", ChartController)
application.register("notifications", NotificationsController)
application.register("tag-color", TagColorController)
