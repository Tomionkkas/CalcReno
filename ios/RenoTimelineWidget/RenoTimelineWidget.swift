//
//  RenoTimelineWidget.swift
//  RenoTimelineWidget
//
//  Production widget implementation for displaying RenoTimeline tasks
//

import WidgetKit
import SwiftUI

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetTaskEntry {
        WidgetTaskEntry(date: Date(), tasks: [], state: .loading)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetTaskEntry) -> ()) {
        let entry = loadWidgetData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetTaskEntry>) -> ()) {
        let entry = loadWidgetData()

        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    // MARK: - Load Widget Data

    private func loadWidgetData() -> WidgetTaskEntry {
        let dataManager = WidgetDataManager.shared

        print("📱 [Widget] ========== Loading Widget Data ==========")
        print("📱 [Widget] Current time: \(Date())")

        // Check if user is logged in
        let token = dataManager.getAuthToken()
        print("📱 [Widget] Auth token exists: \(token != nil)")
        print("📱 [Widget] Auth token length: \(token?.count ?? 0)")
        print("📱 [Widget] Auth token preview: \(token?.prefix(20) ?? "nil")...")

        guard let token = token, !token.isEmpty else {
            print("📱 [Widget] ❌ No auth token - showing logged out state")
            return WidgetTaskEntry(date: Date(), tasks: [], state: .loggedOut)
        }

        print("📱 [Widget] ✅ Auth token found!")

        // Load tasks data from App Groups
        let tasksJson = dataManager.getTasksData()
        print("📱 [Widget] Tasks data exists: \(tasksJson != nil)")
        print("📱 [Widget] Tasks data length: \(tasksJson?.count ?? 0)")

        guard let tasksJson = tasksJson else {
            print("📱 [Widget] ❌ No tasks data - showing empty state")
            if let lastUpdate = dataManager.getLastUpdate() {
                print("📱 [Widget] Last update: \(lastUpdate)")
            } else {
                print("📱 [Widget] No last update timestamp found")
            }
            return WidgetTaskEntry(date: Date(), tasks: [], state: .empty)
        }

        print("📱 [Widget] ✅ Tasks JSON found!")
        print("📱 [Widget] Tasks JSON preview: \(tasksJson.prefix(100))...")

        // Parse tasks JSON
        guard let data = tasksJson.data(using: .utf8) else {
            print("📱 [Widget] ❌ Failed to convert JSON string to data")
            return WidgetTaskEntry(date: Date(), tasks: [], state: .error("Błąd konwersji danych"))
        }

        // Try to decode the tasks
        do {
            let tasks = try JSONDecoder().decode([TaskData].self, from: data)
            print("📱 [Widget] ✅ Decoded \(tasks.count) tasks")

            if tasks.isEmpty {
                print("📱 [Widget] Tasks array is empty - showing empty state")
                return WidgetTaskEntry(date: Date(), tasks: [], state: .empty)
            }

            // Log detailed task information
            let topTasks = Array(tasks.prefix(5))
            print("📱 [Widget] ✅ Loaded \(topTasks.count) tasks successfully")
            for (index, task) in topTasks.enumerated() {
                print("📱 [Widget]   Task \(index + 1): \(task.name)")
                print("📱 [Widget]     - Priority: \(task.priority) -> \(task.priorityLevel)")
                print("📱 [Widget]     - Status: \(task.status ?? "nil")")
                print("📱 [Widget]     - Assigned to: \(task.assignedMemberName)")
                if let member = task.assignedTo {
                    print("📱 [Widget]       (ID: \(member.id), Name: \(member.firstName) \(member.lastName))")
                } else {
                    print("📱 [Widget]       (assignedTo is nil)")
                }
                print("📱 [Widget]     - End date: \(task.endDate)")
            }
            print("📱 [Widget] ========================================")

            return WidgetTaskEntry(date: Date(), tasks: topTasks, state: .tasks)
        } catch {
            print("📱 [Widget] ❌ Failed to decode tasks JSON")
            print("📱 [Widget] Error: \(error)")
            print("📱 [Widget] Raw JSON: \(tasksJson)")
            return WidgetTaskEntry(date: Date(), tasks: [], state: .error("Błąd parsowania danych"))
        }
    }
}

// MARK: - Widget Configuration

struct RenoTimelineWidget: Widget {
    let kind: String = "RenoTimelineWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            RenoTimelineWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("RenoTimeline")
        .description("Wyświetla pilne zadania z RenoTimeline")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    RenoTimelineWidget()
} timeline: {
    WidgetTaskEntry(
        date: .now,
        tasks: [
            TaskData(
                id: "1",
                name: "Wymiana okien w salonie",
                priority: 9,
                endDate: "2025-12-15",
                status: "in_progress",
                assignedTo: TeamMemberData(id: "1", firstName: "Jan", lastName: "Kowalski"),
                project: ProjectData(name: "Remont mieszkania")
            )
        ],
        state: .tasks
    )
}

#Preview(as: .systemMedium) {
    RenoTimelineWidget()
} timeline: {
    WidgetTaskEntry(
        date: .now,
        tasks: [
            TaskData(id: "1", name: "Wymiana okien", priority: 9, endDate: "2025-12-15", status: "in_progress", assignedTo: TeamMemberData(id: "1", firstName: "Jan", lastName: "Kowalski"), project: ProjectData(name: "Remont")),
            TaskData(id: "2", name: "Malowanie ścian", priority: 6, endDate: "2025-12-18", status: "pending", assignedTo: TeamMemberData(id: "2", firstName: "Anna", lastName: "Nowak"), project: ProjectData(name: "Remont")),
            TaskData(id: "3", name: "Montaż podłogi", priority: 3, endDate: "2025-12-20", status: "pending", assignedTo: TeamMemberData(id: "3", firstName: "Piotr", lastName: "Wiśniewski"), project: ProjectData(name: "Remont"))
        ],
        state: .tasks
    )
}
