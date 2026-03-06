import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/chat_api.dart';
import '../api/dio_client.dart';
import '../models/chat_message.dart';

final chatApiProvider = Provider<ChatApi>((ref) => ChatApi(ref.read(dioProvider)));

final chatProvider = NotifierProvider<ChatNotifier, List<ChatMessage>>(ChatNotifier.new);

class ChatNotifier extends Notifier<List<ChatMessage>> {
  bool _historyLoaded = false;

  @override
  List<ChatMessage> build() => [];

  void loadHistory(List<ChatMessage> history) {
    if (_historyLoaded || history.isEmpty) return;
    _historyLoaded = true;
    state = [...history, ...state];
  }

  void addMessage(ChatMessage msg) {
    state = [...state, msg];
  }

  void replaceLastLoading(ChatMessage msg) {
    if (state.isEmpty) {
      state = [msg];
      return;
    }
    final last = state.last;
    if (last.role == 'loading') {
      state = [...state.sublist(0, state.length - 1), msg];
    } else {
      state = [...state, msg];
    }
  }

  void clear() {
    state = [];
    _historyLoaded = false;
  }
}
