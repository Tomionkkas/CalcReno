//
//  WidgetDataManager.swift
//  CalcReno
//
//  Shared utility for managing widget data via App Groups
//

import Foundation
import WidgetKit

class WidgetDataManager {
    static let shared = WidgetDataManager()

    private let appGroupIdentifier = "group.com.tomionkka.calcreno.shared"
    private let authTokenKey = "widget_auth_token"
    private let tasksDataKey = "widget_tasks_data"
    private let lastUpdateKey = "widget_last_update"

    private var userDefaults: UserDefaults? {
        return UserDefaults(suiteName: appGroupIdentifier)
    }

    // MARK: - Save Methods (Called from React Native Bridge)

    /// Save authentication token to shared storage
    func saveAuthToken(_ token: String) {
        print("💾 [WidgetDataManager] Saving auth token (length: \(token.count))")
        print("💾 [WidgetDataManager] App Group: \(appGroupIdentifier)")
        print("💾 [WidgetDataManager] UserDefaults available: \(userDefaults != nil)")

        userDefaults?.set(token, forKey: authTokenKey)
        let syncResult = userDefaults?.synchronize()
        print("💾 [WidgetDataManager] Sync result: \(syncResult ?? false)")

        // Verify it was saved
        let savedToken = userDefaults?.string(forKey: authTokenKey)
        print("💾 [WidgetDataManager] Verification - Token saved: \(savedToken != nil), length: \(savedToken?.count ?? 0)")
        print("✅ WidgetDataManager: Auth token saved to App Groups")
    }

    /// Save tasks JSON data to shared storage and trigger widget reload
    func saveTasksData(_ jsonString: String) {
        print("💾 [WidgetDataManager] Saving tasks data (length: \(jsonString.count))")
        print("💾 [WidgetDataManager] App Group: \(appGroupIdentifier)")
        print("💾 [WidgetDataManager] Tasks preview: \(jsonString.prefix(100))...")

        userDefaults?.set(jsonString, forKey: tasksDataKey)
        userDefaults?.set(Date(), forKey: lastUpdateKey)
        let syncResult = userDefaults?.synchronize()
        print("💾 [WidgetDataManager] Sync result: \(syncResult ?? false)")

        // Verify it was saved
        let savedData = userDefaults?.string(forKey: tasksDataKey)
        print("💾 [WidgetDataManager] Verification - Data saved: \(savedData != nil), length: \(savedData?.count ?? 0)")

        // Trigger widget reload immediately
        WidgetCenter.shared.reloadAllTimelines()
        print("✅ WidgetDataManager: Tasks data saved and widget reloaded")
    }

    /// Clear all widget data (called on logout)
    func clearData() {
        userDefaults?.removeObject(forKey: authTokenKey)
        userDefaults?.removeObject(forKey: tasksDataKey)
        userDefaults?.removeObject(forKey: lastUpdateKey)
        userDefaults?.synchronize()

        // Trigger widget reload to show logged-out state
        WidgetCenter.shared.reloadAllTimelines()
        print("✅ WidgetDataManager: All data cleared and widget reloaded")
    }

    // MARK: - Read Methods (Called from Widget)

    /// Get stored authentication token
    func getAuthToken() -> String? {
        let token = userDefaults?.string(forKey: authTokenKey)
        print("🔍 [WidgetDataManager] Getting auth token: exists=\(token != nil), length=\(token?.count ?? 0)")
        return token
    }

    /// Get stored tasks JSON data
    func getTasksData() -> String? {
        let data = userDefaults?.string(forKey: tasksDataKey)
        print("🔍 [WidgetDataManager] Getting tasks data: exists=\(data != nil), length=\(data?.count ?? 0)")
        if let preview = data?.prefix(100) {
            print("🔍 [WidgetDataManager] Tasks data preview: \(preview)...")
        }
        return data
    }

    /// Get last update timestamp
    func getLastUpdate() -> Date? {
        let date = userDefaults?.object(forKey: lastUpdateKey) as? Date
        print("🔍 [WidgetDataManager] Getting last update: \(date?.description ?? "nil")")
        return date
    }

    // MARK: - Debug Methods

    /// Test App Groups configuration (for debugging)
    func testAppGroups() {
        saveAuthToken("test_token_12345")
        print("Test token saved: \(getAuthToken() ?? "nil")")

        saveTasksData("[{\"id\":\"1\",\"name\":\"Test Task\",\"priority\":8,\"end_date\":\"2025-12-15\",\"project\":{\"name\":\"Test Project\"}}]")
        print("Test tasks saved: \(getTasksData() ?? "nil")")

        if let lastUpdate = getLastUpdate() {
            print("Last update: \(lastUpdate)")
        }
    }
}
