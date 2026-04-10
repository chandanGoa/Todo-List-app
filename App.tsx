import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Member = {
  id: string;
  name: string;
  online: boolean;
  color: string;
};

type Todo = {
  id: string;
  title: string;
  done: boolean;
  assigneeId: string;
  priority: 'Low' | 'Medium' | 'High';
  due: string;
};

type Activity = {
  id: string;
  text: string;
  time: string;
};

type Filter = 'all' | 'open' | 'done' | 'mine';

const currentUserId = 'member-1';

const members: Member[] = [
  { id: 'member-1', name: 'You', online: true, color: '#22c55e' },
  { id: 'member-2', name: 'Mia', online: true, color: '#8b5cf6' },
  { id: 'member-3', name: 'Liam', online: false, color: '#f97316' },
  { id: 'member-4', name: 'Noah', online: true, color: '#06b6d4' },
];

const initialTodos: Todo[] = [
  {
    id: 'todo-1',
    title: 'Finalize onboarding checklist',
    done: false,
    assigneeId: 'member-1',
    priority: 'High',
    due: 'Today',
  },
  {
    id: 'todo-2',
    title: 'Prepare launch notes for the team',
    done: false,
    assigneeId: 'member-2',
    priority: 'Medium',
    due: 'Tomorrow',
  },
  {
    id: 'todo-3',
    title: 'Review bug fixes before release',
    done: true,
    assigneeId: 'member-4',
    priority: 'Low',
    due: 'Done',
  },
];

const initialActivity: Activity[] = [
  { id: 'activity-1', text: 'Mia assigned “Prepare launch notes” to herself.', time: '09:10' },
  { id: 'activity-2', text: 'Noah completed “Review bug fixes before release”.', time: '08:42' },
  { id: 'activity-3', text: 'You created the shared board.', time: '08:15' },
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [activities, setActivities] = useState<Activity[]>(initialActivity);
  const [newTask, setNewTask] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(currentUserId);
  const [filter, setFilter] = useState<Filter>('all');

  const memberLookup = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member])) as Record<string, Member>,
    []
  );

  const filteredTodos = useMemo(() => {
    if (filter === 'open') {
      return todos.filter((todo) => !todo.done);
    }

    if (filter === 'done') {
      return todos.filter((todo) => todo.done);
    }

    if (filter === 'mine') {
      return todos.filter((todo) => todo.assigneeId === currentUserId);
    }

    return todos;
  }, [filter, todos]);

  const completedCount = todos.filter((todo) => todo.done).length;
  const openCount = todos.length - completedCount;
  const onlineCount = members.filter((member) => member.online).length;
  const progress = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  const pushActivity = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActivities((current) => [
      { id: `${Date.now()}-${Math.random()}`, text, time },
      ...current,
    ].slice(0, 6));
  };

  const addTask = () => {
    const title = newTask.trim();

    if (!title) {
      Alert.alert('Add a task', 'Enter a task title for your shared board.');
      return;
    }

    const assignee = memberLookup[selectedAssignee];

    const todo: Todo = {
      id: `todo-${Date.now()}`,
      title,
      done: false,
      assigneeId: selectedAssignee,
      priority: 'Medium',
      due: 'This week',
    };

    setTodos((current) => [todo, ...current]);
    setNewTask('');
    pushActivity(`You assigned “${title}” to ${assignee.name}.`);
  };

  const toggleTodo = (id: string) => {
    let updatedTodo: Todo | undefined;

    setTodos((current) =>
      current.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        updatedTodo = { ...todo, done: !todo.done };
        return updatedTodo;
      })
    );

    if (updatedTodo) {
      const assignee = memberLookup[updatedTodo.assigneeId];
      pushActivity(
        `${assignee.name} ${updatedTodo.done ? 'completed' : 'reopened'} “${updatedTodo.title}”.`
      );
    }
  };

  const cycleAssignee = (id: string) => {
    let updatedTodo: Todo | undefined;

    setTodos((current) =>
      current.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const currentIndex = members.findIndex((member) => member.id === todo.assigneeId);
        const nextMember = members[(currentIndex + 1) % members.length];
        updatedTodo = { ...todo, assigneeId: nextMember.id };
        return updatedTodo;
      })
    );

    if (updatedTodo) {
      const assignee = memberLookup[updatedTodo.assigneeId];
      pushActivity(`Task “${updatedTodo.title}” moved to ${assignee.name}.`);
    }
  };

  const simulateTeamUpdate = () => {
    const teammatePool = members.filter((member) => member.id !== currentUserId);
    const teammate = teammatePool[Math.floor(Math.random() * teammatePool.length)];
    const openTodos = todos.filter((todo) => !todo.done);

    if (openTodos.length === 0) {
      pushActivity(`${teammate.name} checked in — everything is already done.`);
      return;
    }

    const targetTodo = openTodos[Math.floor(Math.random() * openTodos.length)];

    setTodos((current) =>
      current.map((todo) =>
        todo.id === targetTodo.id ? { ...todo, done: true, assigneeId: teammate.id } : todo
      )
    );

    pushActivity(`${teammate.name} completed “${targetTodo.title}” from their phone.`);
  };

  const shareBoard = () => {
    Alert.alert('Invite teammates', 'Share code: TEAM-TODO-24');
    pushActivity('You shared the invite code with the team.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>COLLABORATION READY</Text>
          <Text style={styles.title}>Team Todo Board</Text>
          <Text style={styles.subtitle}>
            A mobile-first workspace for shared tasks, quick assignment, and live team updates.
          </Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={addTask}>
              <Text style={styles.primaryButtonText}>Add task</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={shareBoard}>
              <Text style={styles.secondaryButtonText}>Invite</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{openCount}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{onlineCount}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Collaborators</Text>
          <View style={styles.membersRow}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberChip}>
                <View style={[styles.memberDot, { backgroundColor: member.color }]} />
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberStatus}>{member.online ? 'Online' : 'Away'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Create shared task</Text>
          <TextInput
            placeholder="What needs to be done?"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={newTask}
            onChangeText={setNewTask}
          />

          <Text style={styles.inputLabel}>Assign to</Text>
          <View style={styles.assigneeRow}>
            {members.map((member) => {
              const selected = selectedAssignee === member.id;
              return (
                <Pressable
                  key={member.id}
                  style={[styles.assigneeButton, selected && styles.assigneeButtonSelected]}
                  onPress={() => setSelectedAssignee(member.id)}
                >
                  <Text style={[styles.assigneeText, selected && styles.assigneeTextSelected]}>
                    {member.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shared board</Text>
            <Pressable onPress={simulateTeamUpdate}>
              <Text style={styles.linkText}>Simulate teammate update</Text>
            </Pressable>
          </View>

          <View style={styles.filterRow}>
            {(['all', 'open', 'done', 'mine'] as Filter[]).map((item) => {
              const active = item === filter;
              return (
                <Pressable
                  key={item}
                  style={[styles.filterButton, active && styles.filterButtonActive]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredTodos.map((todo) => {
            const assignee = memberLookup[todo.assigneeId];
            return (
              <View key={todo.id} style={[styles.todoCard, todo.done && styles.todoCardDone]}>
                <View style={styles.todoHeaderRow}>
                  <Text style={[styles.todoTitle, todo.done && styles.todoTitleDone]}>{todo.title}</Text>
                  <View style={[styles.priorityBadge, priorityStyles[todo.priority]]}>
                    <Text style={styles.priorityText}>{todo.priority}</Text>
                  </View>
                </View>

                <Text style={styles.todoMeta}>
                  Assigned to {assignee.name} • Due {todo.due}
                </Text>

                <View style={styles.todoActionRow}>
                  <Pressable style={styles.todoActionButton} onPress={() => toggleTodo(todo.id)}>
                    <Text style={styles.todoActionText}>{todo.done ? 'Reopen' : 'Mark done'}</Text>
                  </Pressable>
                  <Pressable style={styles.todoGhostButton} onPress={() => cycleAssignee(todo.id)}>
                    <Text style={styles.todoGhostText}>Reassign</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityRow}>
              <View style={styles.activityBullet} />
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const priorityStyles = StyleSheet.create({
  Low: {
    backgroundColor: '#dcfce7',
  },
  Medium: {
    backgroundColor: '#dbeafe',
  },
  High: {
    backgroundColor: '#fee2e2',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#082f49',
    fontWeight: '800',
  },
  secondaryButton: {
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#e0f2fe',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
  },
  statValue: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#334155',
    marginTop: 6,
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginRight: '2%',
    marginBottom: 8,
  },
  memberDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  memberName: {
    color: '#0f172a',
    fontWeight: '700',
  },
  memberStatus: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#334155',
    fontWeight: '700',
    marginBottom: 8,
  },
  assigneeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  assigneeButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  assigneeButtonSelected: {
    backgroundColor: '#0f172a',
  },
  assigneeText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  assigneeTextSelected: {
    color: '#f8fafc',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#f8fafc',
  },
  todoCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  todoCardDone: {
    opacity: 0.75,
  },
  todoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  todoTitle: {
    flex: 1,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#475569',
  },
  priorityBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '800',
  },
  todoMeta: {
    color: '#475569',
    marginBottom: 12,
  },
  todoActionRow: {
    flexDirection: 'row',
  },
  todoActionButton: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  todoActionText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  todoGhostButton: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  todoGhostText: {
    color: '#334155',
    fontWeight: '700',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38bdf8',
    marginTop: 6,
    marginRight: 10,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityText: {
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    color: '#64748b',
    fontSize: 12,
  },
});
