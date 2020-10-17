import 'package:codementorship/blocs/app_navigator/app_navigator_bloc.dart';
import 'package:codementorship/shared/app_defaults.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'app_navigator_bottom.dart';

class MainPage extends StatefulWidget {
  MainPage({Key key, this.title = "MainPage"}) : super(key: key);
  final String title;

  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  APP_PAGE _currentPage = APP_PAGE.HOME;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: BlocListener<AppNavigatorBloc, AppNavigatorState>(
        listener: (context, state) {
          if (state is AppPageState) {
            setState(() {
              _currentPage = state.tab;
            });
          }
        },
        child: Center(
          child: Text('currentPage: $_currentPage'),
        ),
      ),
      bottomNavigationBar: AppNavigatorBottom(), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
