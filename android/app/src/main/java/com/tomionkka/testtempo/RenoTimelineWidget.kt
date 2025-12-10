package com.tomionkka.testtempo

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.StrictMode
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

class RenoTimelineWidget : AppWidgetProvider() {

    private val SUPABASE_URL = "https://kralcmyhjvoiywcpntkg.supabase.co"
    private val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYWxjbXloanZvaXl3Y3BudGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzM3OTAsImV4cCI6MjA3MTQ0OTc5MH0.10JbU5SR2bwJyGorKifCVqCqQcnbBR4xup7NnYxz3AE"
    
    private val PREFS_FILE = "widget_prefs"
    private val ACTION_REFRESH = "com.tomionkka.testtempo.WIDGET_REFRESH"

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        if (intent.action == ACTION_REFRESH) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, RenoTimelineWidget::class.java)
            )
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        // TEST: Use minimal layout first to verify widget loads
        val views = RemoteViews(context.packageName, R.layout.renotimeline_widget)
        views.setTextViewText(R.id.task_count, "TEST")

        // Update immediately with basic layout
        appWidgetManager.updateAppWidget(appWidgetId, views)

        // Then do async data loading
        CoroutineScope(Dispatchers.IO).launch {
            val asyncViews = RemoteViews(context.packageName, R.layout.renotimeline_widget)
            
            // Header opens app
            val openAppIntent = Intent(context, MainActivity::class.java)
            val openAppPendingIntent = PendingIntent.getActivity(
                context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.header_container, openAppPendingIntent)
            
            // Refresh intent for tap-to-refresh
            val refreshIntent = Intent(context, RenoTimelineWidget::class.java)
            refreshIntent.action = ACTION_REFRESH
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val prefs = context.applicationContext.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
            val rawToken = prefs.getString("auth_token", null)
            val token = rawToken?.replace("\"", "")?.trim()

            if (token.isNullOrEmpty()) {
                withContext(Dispatchers.Main) {
                    showLoginState(asyncViews, "Zaloguj się w aplikacji", refreshPendingIntent)
                    appWidgetManager.updateAppWidget(appWidgetId, asyncViews)
                }
                return@launch
            }

            try {
                val queryUrl = "$SUPABASE_URL/rest/v1/rpc/get_user_top_tasks"
                
                val url = URL(queryUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true 
                
                connection.setRequestProperty("apikey", SUPABASE_ANON_KEY)
                connection.setRequestProperty("Authorization", "Bearer $token")
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Prefer", "params=single-object")
                
                val body = "{}"
                connection.setRequestProperty("Content-Length", body.length.toString())
                
                val os = connection.outputStream
                os.write(body.toByteArray())
                os.flush()
                os.close()
                
                val responseCode = connection.responseCode
                if (responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()
                    
                    val responseStr = response.toString()
                    withContext(Dispatchers.Main) {
                        if (responseStr.isNotEmpty() && responseStr != "null" && responseStr != "[]") {
                            val tasks = JSONArray(responseStr)
                            showTasksData(asyncViews, tasks, refreshPendingIntent)
                        } else {
                            showEmptyState(asyncViews, refreshPendingIntent)
                        }
                        appWidgetManager.updateAppWidget(appWidgetId, asyncViews)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        showLoginState(asyncViews, "Błąd: $responseCode\nDotknij aby odświeżyć", refreshPendingIntent)
                        appWidgetManager.updateAppWidget(appWidgetId, asyncViews)
                    }
                }

            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    showLoginState(asyncViews, "Błąd połączenia\nDotknij aby odświeżyć", refreshPendingIntent)
                    appWidgetManager.updateAppWidget(appWidgetId, asyncViews)
                }
            }
        }
    }

    private fun showLoginState(views: RemoteViews, message: String, refreshIntent: PendingIntent) {
        views.setViewVisibility(R.id.widget_login, View.VISIBLE)
        views.setTextViewText(R.id.widget_login_text, message)
        views.setViewVisibility(R.id.tasks_container, View.GONE)
        views.setViewVisibility(R.id.widget_empty, View.GONE)
        views.setViewVisibility(R.id.widget_loading, View.GONE)
        views.setOnClickPendingIntent(R.id.widget_login, refreshIntent)
    }

    private fun showEmptyState(views: RemoteViews, refreshIntent: PendingIntent) {
        views.setViewVisibility(R.id.widget_empty, View.VISIBLE)
        views.setViewVisibility(R.id.tasks_container, View.GONE)
        views.setViewVisibility(R.id.widget_login, View.GONE)
        views.setViewVisibility(R.id.widget_loading, View.GONE)
        views.setOnClickPendingIntent(R.id.widget_empty, refreshIntent)
    }

    private fun showTasksData(views: RemoteViews, tasks: JSONArray, refreshIntent: PendingIntent) {
        views.setViewVisibility(R.id.tasks_container, View.VISIBLE)
        views.setViewVisibility(R.id.widget_login, View.GONE)
        views.setViewVisibility(R.id.widget_empty, View.GONE)
        views.setViewVisibility(R.id.widget_loading, View.GONE)

        val taskCount = tasks.length()
        views.setTextViewText(R.id.task_count, "$taskCount ${if (taskCount == 1) "zadanie" else if (taskCount < 5) "zadania" else "zadań"}")

        // Featured task (most urgent)
        if (taskCount > 0) {
            val task = tasks.getJSONObject(0)
            populateFeaturedTask(views, task)
            views.setOnClickPendingIntent(R.id.featured_task, refreshIntent)
        }

        // Additional tasks
        val additionalTaskIds = listOf(
            R.id.task_2, R.id.task_3, R.id.task_4, R.id.task_5
        )

        if (taskCount > 1) {
            views.setViewVisibility(R.id.other_tasks_header, View.VISIBLE)
        } else {
            views.setViewVisibility(R.id.other_tasks_header, View.GONE)
        }

        for (i in 1 until taskCount) {
            if (i <= 4) {
                val task = tasks.getJSONObject(i)
                val taskId = additionalTaskIds[i - 1]
                populateAdditionalTask(views, task, i + 1)
                views.setViewVisibility(taskId, View.VISIBLE)
                views.setOnClickPendingIntent(taskId, refreshIntent)
            }
        }

        // Hide unused task slots
        for (i in taskCount until 5) {
            if (i > 0) {
                views.setViewVisibility(additionalTaskIds[i - 1], View.GONE)
            }
        }
    }

    private fun populateFeaturedTask(views: RemoteViews, task: JSONObject) {
        val name = task.optString("name", "Bez nazwy")
        val priority = task.optInt("priority", 5)
        val endDate = task.optString("end_date", "")
        
        var projectName = "Projekt"
        if (task.has("project") && !task.isNull("project")) {
             val projectObj = task.getJSONObject("project")
             projectName = projectObj.optString("name", "Projekt")
        }

        views.setTextViewText(R.id.featured_task_name, name)
        views.setTextViewText(R.id.featured_project_name, projectName)
        views.setTextViewText(R.id.featured_task_date, formatDate(endDate))

        // Priority badge
        val (badgeText, badgeColor) = getPriorityInfo(priority)
        views.setTextViewText(R.id.featured_priority_badge, badgeText)
        views.setInt(R.id.featured_priority_badge, "setBackgroundColor", badgeColor)
    }

    private fun populateAdditionalTask(views: RemoteViews, task: JSONObject, position: Int) {
        val name = task.optString("name", "Bez nazwy")
        val priority = task.optInt("priority", 5)
        val endDate = task.optString("end_date", "")
        
        var projectName = "Projekt"
        if (task.has("project") && !task.isNull("project")) {
             val projectObj = task.getJSONObject("project")
             projectName = projectObj.optString("name", "Projekt")
        }

        when (position) {
            2 -> {
                views.setTextViewText(R.id.task_2_name, name)
                views.setTextViewText(R.id.task_2_project, projectName)
                views.setTextViewText(R.id.task_2_date, formatDateShort(endDate))
                views.setInt(R.id.task_2_priority, "setBackgroundColor", getPriorityColor(priority))
            }
            3 -> {
                views.setTextViewText(R.id.task_3_name, name)
                views.setTextViewText(R.id.task_3_project, projectName)
                views.setTextViewText(R.id.task_3_date, formatDateShort(endDate))
                views.setInt(R.id.task_3_priority, "setBackgroundColor", getPriorityColor(priority))
            }
            4 -> {
                views.setTextViewText(R.id.task_4_name, name)
                views.setTextViewText(R.id.task_4_project, projectName)
                views.setTextViewText(R.id.task_4_date, formatDateShort(endDate))
                views.setInt(R.id.task_4_priority, "setBackgroundColor", getPriorityColor(priority))
            }
            5 -> {
                views.setTextViewText(R.id.task_5_name, name)
                views.setTextViewText(R.id.task_5_project, projectName)
                views.setTextViewText(R.id.task_5_date, formatDateShort(endDate))
                views.setInt(R.id.task_5_priority, "setBackgroundColor", getPriorityColor(priority))
            }
        }
    }

    private fun getPriorityInfo(priority: Int): Pair<String, Int> {
        return when {
            priority >= 8 -> Pair("PILNE", android.graphics.Color.parseColor("#EF4444"))
            priority >= 4 -> Pair("ŚREDNI", android.graphics.Color.parseColor("#F59E0B"))
            else -> Pair("NISKI", android.graphics.Color.parseColor("#6366F1"))
        }
    }

    private fun getPriorityColor(priority: Int): Int {
        return when {
            priority >= 8 -> android.graphics.Color.parseColor("#EF4444")
            priority >= 4 -> android.graphics.Color.parseColor("#F59E0B")
            else -> android.graphics.Color.parseColor("#6366F1")
        }
    }

    private fun formatDate(dateStr: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("d MMM yyyy", Locale("pl", "PL"))
            val date = inputFormat.parse(dateStr)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            dateStr
        }
    }

    private fun formatDateShort(dateStr: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("d MMM", Locale("pl", "PL"))
            val date = inputFormat.parse(dateStr)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            dateStr
        }
    }
}
