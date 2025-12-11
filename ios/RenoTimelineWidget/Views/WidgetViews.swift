//
//  WidgetViews.swift
//  RenoTimelineWidget
//
//  SwiftUI views for RenoTimeline widget
//  Supports Small (2x2) and Medium (4x2) widget sizes
//

import SwiftUI
import WidgetKit

// MARK: - Entry View (Routing)

struct RenoTimelineWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: WidgetTaskEntry

    var body: some View {
        switch entry.state {
        case .loading:
            LoadingStateView()
        case .loggedOut:
            LoggedOutStateView()
        case .empty:
            EmptyStateView()
        case .tasks:
            if family == .systemSmall {
                SmallWidgetView(entry: entry)
            } else {
                MediumWidgetView(entry: entry)
            }
        case .error(let message):
            ErrorStateView(message: message)
        }
    }
}

// MARK: - Small Widget (2x2)

struct SmallWidgetView: View {
    let entry: WidgetTaskEntry
    @Environment(\.widgetRenderingMode) var renderingMode

    var body: some View {
        if let task = entry.tasks.first {
            VStack(alignment: .leading, spacing: 0) {
                // Top row: Priority badge + Date
                HStack(alignment: .center, spacing: 0) {
                    // Priority badge
                    Text(task.priorityLevel.label)
                        .font(.system(size: 7, weight: .bold))
                        .foregroundColor(renderingMode == .fullColor ? .white : .primary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(
                            renderingMode == .fullColor
                                ? Color(hex: task.priorityLevel.color)
                                : Color.primary.opacity(0.2)
                        )
                        .cornerRadius(4)
                        .fixedSize()
                        .widgetAccentable()

                    Spacer()

                    // Date
                    Text(task.formattedDateShort)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(renderingMode == .fullColor ? Color(hex: "#94A3B8") : .primary)
                        .widgetAccentable()
                }
                .padding(.bottom, 12)

                Spacer()

                // Task name (centered vertically)
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.name)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(renderingMode == .fullColor ? .white : .primary)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                        .widgetAccentable()

                    // Project/location
                    if let project = task.project {
                        Text(project.name)
                            .font(.system(size: 12, weight: .regular))
                            .foregroundColor(renderingMode == .fullColor ? Color(hex: "#94A3B8") : .secondary)
                            .lineLimit(1)
                            .widgetAccentable()
                    }
                }

                Spacer()

                // Bottom: User info
                HStack(spacing: 6) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(renderingMode == .fullColor ? Color(hex: "#64748B") : .secondary)
                        .widgetAccentable()

                    Text(task.assignedMemberName)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(renderingMode == .fullColor ? Color(hex: "#94A3B8") : .secondary)
                        .lineLimit(1)
                        .widgetAccentable()
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .containerBackground(for: .widget) {
                LinearGradient(
                    colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
        }
    }
}

// MARK: - Medium Widget (4x2)

struct MediumWidgetView: View {
    let entry: WidgetTaskEntry
    @Environment(\.widgetRenderingMode) var renderingMode

    var body: some View {
        HStack(spacing: 10) {
            // Left section: Main task (60% width)
            if let mainTask = entry.tasks.first {
                MainTaskCard(task: mainTask, renderingMode: renderingMode)
                    .frame(maxWidth: .infinity)
            }

            // Right section: 2 smaller tasks (40% width)
            if entry.tasks.count > 1 {
                VStack(spacing: 8) {
                    ForEach(Array(entry.tasks.dropFirst().prefix(2))) { task in
                        MiniTaskCard(task: task, renderingMode: renderingMode)
                    }

                    // If only 1 task in right column, add spacer
                    if entry.tasks.count == 2 {
                        Spacer()
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - Main Task Card (Left Section of Medium Widget)

struct MainTaskCard: View {
    let task: TaskData
    var renderingMode: WidgetRenderingMode

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top: Priority badge + Status
            HStack(spacing: 8) {
                Text(task.priorityLevel.label)
                    .font(.system(size: 8, weight: .bold))
                    .foregroundColor(renderingMode == .fullColor ? .white : .primary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        renderingMode == .fullColor
                            ? Color(hex: task.priorityLevel.color)
                            : Color.primary.opacity(0.2)
                    )
                    .cornerRadius(5)
                    .fixedSize()
                    .widgetAccentable()

                if task.isInProgress {
                    Text("W toku")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(Color(hex: "#94A3B8"))
                }
            }
            .padding(.bottom, 10)

            Spacer()

            // Task name
            VStack(alignment: .leading, spacing: 6) {
                Text(task.name)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)

                // Project/location
                if let project = task.project {
                    Text(project.name)
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(Color(hex: "#94A3B8"))
                        .lineLimit(1)
                }
            }

            Spacer()

            // Bottom: User + Calendar
            HStack(spacing: 12) {
                HStack(spacing: 5) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 13))
                        .foregroundColor(Color(hex: "#64748B"))

                    Text(task.assignedMemberName)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color(hex: "#94A3B8"))
                        .lineLimit(1)
                }

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "calendar")
                        .font(.system(size: 11))
                        .foregroundColor(Color(hex: "#64748B"))

                    Text(task.formattedDateShort)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color(hex: "#94A3B8"))
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(hex: "#3A4C66").opacity(0.4))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .strokeBorder(Color(hex: "#4A5F7F").opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Mini Task Card (Right Section of Medium Widget)

struct MiniTaskCard: View {
    let task: TaskData
    var renderingMode: WidgetRenderingMode

    var body: some View{
        VStack(alignment: .leading, spacing: 8) {
            // Top row: Priority + Date
            HStack {
                Text(task.priorityLevel.label)
                    .font(.system(size: 7, weight: .bold))
                    .foregroundColor(renderingMode == .fullColor ? .white : .primary)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(
                        renderingMode == .fullColor
                            ? Color(hex: task.priorityLevel.color)
                            : Color.primary.opacity(0.2)
                    )
                    .cornerRadius(4)
                    .fixedSize()
                    .widgetAccentable()

                Spacer()

                Text(task.formattedDateShort)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(hex: "#94A3B8"))
            }

            // Task name
            Text(task.name)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)

            // User
            HStack(spacing: 5) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "#64748B"))

                Text(task.assignedMemberName)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color(hex: "#94A3B8"))
                    .lineLimit(1)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(hex: "#3A4C66").opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(Color(hex: "#4A5F7F").opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - State Views

struct LoadingStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            ProgressView()
                .tint(.white)
            Text("Ładowanie...")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(Color(hex: "#94A3B8"))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct LoggedOutStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.crop.circle.badge.exclamationmark")
                .font(.system(size: 36))
                .foregroundColor(Color(hex: "#64748B"))
            Text("Zaloguj się w aplikacji")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 36))
                .foregroundColor(Color(hex: "#10B981"))
            Text("Brak pilnych zadań")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
            Text("Wszystko na czas!")
                .font(.system(size: 12))
                .foregroundColor(Color(hex: "#94A3B8"))
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct ErrorStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 32))
                .foregroundColor(Color(hex: "#F59E0B"))
            Text(message)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            Text("Dotknij aby odświeżyć")
                .font(.system(size: 10))
                .foregroundColor(Color(hex: "#94A3B8"))
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(hex: "#2C3E5A"), Color(hex: "#1E2A3D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB (no alpha)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
