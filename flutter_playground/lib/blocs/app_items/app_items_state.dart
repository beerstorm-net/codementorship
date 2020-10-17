part of 'app_items_bloc.dart';

abstract class AppItemsState extends Equatable {
  const AppItemsState();

  @override
  List<Object> get props => [];
}

class AppItemsInitial extends AppItemsState {}

class AppItemsLoaded extends AppItemsState {
  final List<String> appItems;

  const AppItemsLoaded([this.appItems = const []]);

  @override
  List<Object> get props => [appItems];

  @override
  String toString() => 'AppItemsLoaded { appItems: $appItems }';
}
