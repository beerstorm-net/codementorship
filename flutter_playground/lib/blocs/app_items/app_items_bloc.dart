import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'app_items_event.dart';
part 'app_items_state.dart';

class AppItemsBloc extends Bloc<AppItemsEvent, AppItemsState> {
  AppItemsBloc() : super(AppItemsInitial());

  List<String> _defaultItemsList = [
    "item-1",
    "item-2",
    "item-3",
    "item-4",
    "item-5",
    "item-6",
    "item-7",
    "item-8",
  ];

  @override
  Stream<AppItemsState> mapEventToState(
    AppItemsEvent event,
  ) async* {
    // TODO: implement mapEventToState
  }
}
