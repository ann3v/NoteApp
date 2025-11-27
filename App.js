import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = '@notes_app_data';
const CATEGORIES = ['Daily Bugle', 'Web Shooters', 'Spidey Sense', 'Hero Work', 'Personal'];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Daily Bugle');

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    saveNotes();
  }, [notes]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNote = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Web Alert!', 'With great power comes great responsibility... fill in both fields!');
      return;
    }

    const newNote = {
      id: editingNote ? editingNote.id : Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      date: editingNote ? editingNote.date : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingNote) {
      setNotes(notes.map(note => (note.id === editingNote.id ? newNote : note)));
    } else {
      setNotes([newNote, ...notes]);
    }

    resetForm();
    setModalVisible(false);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedCategory(note.category);
    setModalVisible(true);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Web Removal!',
      'Are you sure you want to delete this web note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setSelectedCategory('Daily Bugle');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // 🕷️ SPIDER-MAN THEME COLORS
  const spiderTheme = {
    background: isDarkMode ? '#0c0c1a' : '#f0f0f0',
    card: isDarkMode ? '#1a1a2e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: isDarkMode ? '#b8b8cc' : '#666666',
    border: isDarkMode ? '#2d2d4d' : '#e0e0e0',
    primary: '#e23636', // Spider-Man Red
    accent: '#007acc', // Spider-Man Blue
    danger: '#ff4757',
    web: '#2d2d4d',
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Daily Bugle': spiderTheme.primary,
      'Web Shooters': spiderTheme.accent,
      'Spidey Sense': '#ffd700',
      'Hero Work': '#e23636',
      'Personal': '#00d2d3'
    };
    return colors[category] || spiderTheme.primary;
  };

  const renderNoteItem = ({ item }) => (
    <View
      style={[
        styles.noteCard,
        { 
          backgroundColor: spiderTheme.card,
          borderLeftWidth: 4,
          borderLeftColor: getCategoryColor(item.category)
        },
      ]}
    >
      <View style={styles.noteHeader}>
        <TouchableOpacity
          onPress={() => handleEditNote(item)}
          style={{ flex: 1 }}
        >
          <Text style={[styles.noteTitle, { color: spiderTheme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDeleteNote(item.id)}
          style={[
            styles.deleteButton,
            { backgroundColor: spiderTheme.danger }
          ]}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => handleEditNote(item)} style={{ flex: 1 }}>
        <Text
          style={[styles.noteContent, { color: spiderTheme.textSecondary }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        <View style={styles.noteFooter}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(item.category) + '20' },
            ]}
          >
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.noteDate, { color: spiderTheme.textSecondary }]}>
            {formatDate(item.updatedAt || item.date)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: spiderTheme.background }]}>
      <StatusBar style="light" />

      {/* Spider Web Background Pattern */}
      <View style={styles.webPattern} />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: '#ffffff' }]}>SPIDER-NOTES</Text>
          <Text style={[styles.headerSubtitle, { color: spiderTheme.primary }]}>
            With great notes comes great responsibility
          </Text>
        </View>
        <View style={styles.themeContainer}>
          <Text style={[styles.themeLabel, { color: '#ffffff' }]}>DARK</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: spiderTheme.primary }}
            thumbColor={isDarkMode ? spiderTheme.accent : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: 'rgba(26, 26, 46, 0.8)' }]}>
        <TextInput
          style={[styles.searchInput, { color: '#ffffff' }]}
          placeholder="Search your web of notes..."
          placeholderTextColor={spiderTheme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: spiderTheme.textSecondary }]}>
            {searchQuery ? 'No web notes found' : 'Your web is empty'}
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: spiderTheme.textSecondary }]}>
            {searchQuery ? 'Try a different search term' : 'Thwip! Create your first note!'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: spiderTheme.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>🕷️</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: spiderTheme.background }]}>
          {/* Web Pattern in Modal */}
          <View style={styles.webPattern} />
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: '#ffffff' }]}>
              {editingNote ? 'EDIT WEB NOTE' : 'NEW WEB NOTE'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text
                  style={[styles.cancelButtonText, { color: spiderTheme.textSecondary }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: spiderTheme.primary }]}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveButtonText}>THWIP!</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: '#ffffff' }]}>CATEGORY</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor:
                        selectedCategory === category ? getCategoryColor(category) : 'rgba(26, 26, 46, 0.8)',
                      borderColor: getCategoryColor(category),
                    },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      { color: selectedCategory === category ? '#fff' : getCategoryColor(category) },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: '#ffffff' }]}>TITLE</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: 'rgba(26, 26, 46, 0.8)',
                  color: '#ffffff',
                  borderColor: spiderTheme.primary,
                },
              ]}
              placeholder="Web note title..."
              placeholderTextColor={spiderTheme.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={[styles.label, { color: '#ffffff' }]}>CONTENT</Text>

            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: 'rgba(26, 26, 46, 0.8)',
                  color: '#ffffff',
                  borderColor: spiderTheme.accent,
                },
              ]}
              placeholder="Start weaving your web of thoughts..."
              placeholderTextColor={spiderTheme.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              numberOfLines={10}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
  webPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.1,
    // This creates a simple web-like pattern using gradient
    backgroundImage: `radial-gradient(circle at 25% 25%, #e23636 2px, transparent 2px),
                      radial-gradient(circle at 75% 75%, #007acc 2px, transparent 2px)`,
    backgroundSize: '50px 50px',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
    textShadowColor: '#e23636',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(226, 54, 54, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e23636',
  },
  themeLabel: {
    marginRight: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e23636',
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  notesList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  noteCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 54, 54, 0.3)',
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ perspective: 1000 }],
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
    textShadowColor: 'rgba(226, 54, 54, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noteContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
    fontWeight: '500',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 54, 54, 0.2)',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 70,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 54, 54, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: '#e23636',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(226, 54, 54, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 12,
    fontWeight: '600',
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    minHeight: 160,
    textAlignVertical: 'top',
    lineHeight: 24,
    fontWeight: '500',
    shadowColor: '#007acc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});