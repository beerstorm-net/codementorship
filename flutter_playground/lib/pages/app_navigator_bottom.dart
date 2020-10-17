import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../blocs/app_navigator/app_navigator_bloc.dart';
import '../shared/app_defaults.dart';

class AppNavigatorBottom extends StatefulWidget {
  AppNavigatorBottom({Key key}) : super(key: key);

  @override
  _AppNavigatorBottomState createState() => _AppNavigatorBottomState();
}

class _AppNavigatorBottomState extends State<AppNavigatorBottom> {
  List<APP_PAGE> _screenNames = [APP_PAGE.HOME, APP_PAGE.ETCETC, APP_PAGE.SETTINGS];
  int _selectedTabIndex = 0;
  void _onBottomNavigatorItemTapped(int selectedIndex) {
    setState(() {
      _selectedTabIndex = selectedIndex;
    });

    BlocProvider.of<AppNavigatorBloc>(context).add(AppPageEvent(tab: _screenNames[_selectedTabIndex]));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: BottomNavigationBar(
        currentIndex: _selectedTabIndex,
        onTap: _onBottomNavigatorItemTapped,
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.link), label: 'Etc'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
