package config

import (
	"fmt"
	"github.com/spf13/viper"
)

type Config struct {
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`
	JWTSecret  string `mapstructure:"JWT_SECRET"`
	Port       string `mapstructure:"PORT"`
	AllowedOrigins string `mapstructure:"ALLOWED_ORIGINS"`
}

func LoadConfig() (Config, error) {
	var config Config

	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return config, err
	}

	if err := viper.Unmarshal(&config); err != nil {
		return config, err
	}

	// log out config
	fmt.Printf("DB_HOST: %s\n", config.DBHost)
	fmt.Printf("DB_PORT: %s\n", config.DBPort)
	fmt.Printf("DB_USER: %s\n", config.DBUser)
	fmt.Printf("DB_PASSWORD: %s\n", config.DBPassword)
	fmt.Printf("DB_NAME: %s\n", config.DBName)
	fmt.Printf("JWT_SECRET: %s\n", config.JWTSecret)
	fmt.Printf("PORT: %s\n", config.Port)
	fmt.Printf("ALLOWED_ORIGINS: %s\n", config.AllowedOrigins)

	return config, nil
}
