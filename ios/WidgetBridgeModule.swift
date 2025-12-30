//
//  WidgetBridgeModule.swift
//  CalcReno
//
//  React Native bridge module for syncing data to iOS widget
//  iOS equivalent of Android's WidgetModule.kt
//

import Foundation
import React
import WidgetKit

@objc(WidgetBridgeModule)
class WidgetBridgeModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /// Set data in App Groups shared storage
    /// Called from React Native via: WidgetBridgeModule.setData(key, value)
    @objc
    func setData(_ key: String, value: String) {
        switch key {
        case "auth_token":
            WidgetDataManager.shared.saveAuthToken(value)
        case "tasks_data":
            WidgetDataManager.shared.saveTasksData(value)
        default:
            print("⚠️ WidgetBridgeModule: Unknown key '\(key)'")
            break
        }
    }

    /// Clear all widget data (on logout)
    /// Called from React Native via: WidgetBridgeModule.clearWidgetData()
    @objc
    func clearWidgetData() {
        WidgetDataManager.shared.clearData()
    }

    // MARK: - Optional Test Method

    /// Test App Groups configuration
    /// Called from React Native via: WidgetBridgeModule.testAppGroups()
    @objc
    func testAppGroups() {
        WidgetDataManager.shared.testAppGroups()
    }
}
