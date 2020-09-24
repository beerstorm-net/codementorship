import 'package:codementorship/shared/common_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'blocs/app_navigator/app_navigator_bloc.dart';
import 'blocs/simple_bloc_observer.dart';
import 'main_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Bloc.observer = SimpleBlocObserver();

  final String devicePlatform = await CommonUtils.getDevicePlatform();
  final bool isPhysicalDevice =
      await CommonUtils.isPhysicalDevice(devicePlatform: devicePlatform);
  await Hive.initFlutter();
  Box _hiveBox = await Hive.openBox("appBox");
  // TODO: implement init logic here

  runApp(MultiBlocProvider(providers: [
    BlocProvider<AppNavigatorBloc>(
        lazy: false, create: (context) => AppNavigatorBloc()),
    // TODO: add more BlocProviders as per need
  ], child: MyApp()));
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MainApp();
  }
}
