import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RootState } from "@/store";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const cliente = useSelector((state: RootState) => state.auth.cliente);

  const firstName = cliente?.nome?.trim()?.split(" ")[0] || "U";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="perfil/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => {
            const foto = cliente?.foto;

            // Valida se é uma URL real antes de tentar renderizar
            const isValidUrl =
              typeof foto === "string" &&
              (foto.startsWith("http://") || foto.startsWith("https://"));
            if (isValidUrl) {
              return (
                <Image
                  source={{ uri: foto }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: focused ? 2 : 0,
                    borderColor: color,
                  }}
                  // Fallback caso a imagem falhe ao carregar
                  onError={() => {}}
                />
              );
            }

            return (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: focused ? color : "#6b21a8",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            );
          },
        }}
      />

      {/* ROTA OCULTA */}
      <Tabs.Screen name="salao/[id]" options={{ href: null }} />
    </Tabs>
  );
}
