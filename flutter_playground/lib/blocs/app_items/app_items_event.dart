part of 'app_items_bloc.dart';

abstract class AppItemsEvent extends Equatable {
  const AppItemsEvent();

  @override
  List<Object> get props => [];
}

class LoadAppItemsEvent extends AppItemsEvent {}

class AddAppItemsEvent extends AppItemsEvent {
  final List<String> appItems;

  AddAppItemsEvent(this.appItems);

  @override
  List<Object> get props => [appItems];

  @override
  String toString() => 'AddAppItemsEvent { appItems: $appItems }';
}

class RemoveAppItemsEvent extends AppItemsEvent {
  final List<String> appItems;

  RemoveAppItemsEvent(this.appItems);

  @override
  List<Object> get props => [appItems];

  @override
  String toString() => 'RemoveAppItemsEvent { appItems: $appItems }';
}
