//
//  TaskModels.swift
//  RenoTimelineWidget
//
//  Data models for widget tasks and priorities
//

import Foundation
import WidgetKit

// MARK: - Task Priority Enum

enum TaskPriority: Int {
    case low = 1      // Priority 1
    case medium = 2   // Priority 2
    case high = 3     // Priority 3
    case urgent = 4   // Priority 4

    static func from(value: Int) -> TaskPriority {
        switch value {
        case 1: return .low
        case 2: return .medium
        case 3: return .high
        case 4: return .urgent
        default: return .medium  // Default to medium if unexpected value
        }
    }

    /// Priority badge color (hex string)
    var color: String {
        switch self {
        case .low: return "#8B5CF6"     // Purple (Niski)
        case .medium: return "#FBBF24"  // Yellow (Średni)
        case .high: return "#D97706"    // Orange (Wysoki)
        case .urgent: return "#EF4444"  // Red (Pilne)
        }
    }

    /// Priority label in Polish
    var label: String {
        switch self {
        case .low: return "NISKI"       // Low
        case .medium: return "ŚREDNI"   // Medium
        case .high: return "WYSOKI"     // High
        case .urgent: return "PILNE"    // Urgent
        }
    }
}

// MARK: - Task Data Model

struct TaskData: Codable, Identifiable {
    let id: String
    let name: String
    let priority: Int
    let endDate: String
    let status: String?
    let assignedTo: TeamMemberData?
    let project: ProjectData?

    enum CodingKeys: String, CodingKey {
        case id, name, priority, status
        case endDate = "end_date"
        case assignedTo = "assigned_to"
        case project
    }

    var priorityLevel: TaskPriority {
        return TaskPriority.from(value: priority)
    }

    /// Get assigned team member's full name
    var assignedMemberName: String {
        if let member = assignedTo {
            return "\(member.firstName) \(member.lastName)"
        }
        return "Nieprzypisane"
    }

    /// Check if task is in progress
    var isInProgress: Bool {
        return status == "in_progress"
    }

    /// Formatted date in Polish (e.g., "12 Gru 2025")
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "pl_PL")

        if let date = formatter.date(from: endDate) {
            formatter.dateFormat = "d MMM yyyy"
            return formatter.string(from: date)
        }
        return endDate
    }

    /// Short formatted date in Polish (e.g., "12 Gru")
    var formattedDateShort: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "pl_PL")

        if let date = formatter.date(from: endDate) {
            formatter.dateFormat = "d MMM"
            return formatter.string(from: date)
        }
        return endDate
    }
}

// MARK: - Project Data Model

struct ProjectData: Codable {
    let name: String
}

// MARK: - Team Member Data Model

struct TeamMemberData: Codable {
    let id: String
    let firstName: String
    let lastName: String

    enum CodingKeys: String, CodingKey {
        case id
        case firstName = "first_name"
        case lastName = "last_name"
    }
}

// MARK: - Widget Entry Model

struct WidgetTaskEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskData]
    let state: WidgetState

    enum WidgetState {
        case loading
        case loggedOut
        case empty
        case tasks
        case error(String)
    }
}
