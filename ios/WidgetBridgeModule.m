//
//  WidgetBridgeModule.m
//  CalcReno
//
//  Objective-C bridging header for WidgetBridgeModule
//  Required to expose Swift module to React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetBridgeModule, NSObject)

RCT_EXTERN_METHOD(setData:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(clearWidgetData)
RCT_EXTERN_METHOD(testAppGroups)

@end
