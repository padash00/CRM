// app/login/page.tsx
"use client";

import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared'; // Тема оформления по умолчанию
import { supabase } from '@/lib/supabaseClient'; // Путь к твоему клиенту Supabase
import { useRouter } from 'next/navigation'; // Для перенаправления

// Компонент страницы входа
export default function LoginPage() {
  const router = useRouter();

  // Этот useEffect следит за состоянием аутентификации пользователя
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Если событие - успешный вход (SIGNED_IN)
        if (event === 'SIGNED_IN') {
          console.log('Пользователь вошел, перенаправление на /');
          // Перенаправляем на главную страницу
          // router.push('/') можно использовать, но replace лучше,
          // чтобы страница /login не оставалась в истории браузера
          router.replace('/');
        }
        // Можно добавить обработку других событий, например, выхода
        // if (event === 'SIGNED_OUT') {
        //   // Действия при выходе, если нужно
        // }
      }
    );

    // Важно отписаться от слушателя при размонтировании компонента
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]); // Добавляем router в зависимости useEffect

  return (
    // Простой контейнер для центрирования формы на странице
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      {/* Карточка для самой формы */}
      <div className="w-full max-w-sm p-6 space-y-4 bg-card rounded-lg shadow-md border"> {/* Уменьшил max-w */}
        <h2 className="text-xl font-semibold text-center"> {/* Уменьшил заголовок */}
          Вход / Регистрация
        </h2>

        {/* Компонент Auth UI от Supabase */}
        <Auth
          supabaseClient={supabase} // Передаем клиент Supabase
          appearance={{
             theme: ThemeSupa, // Используем стандартную тему
             // Ты можешь переопределить стили здесь, используя классы Tailwind, если нужно:
             // className: {
             //   button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
             //   input: 'border-border focus:ring-primary',
             // }
          }}
          // theme="dark" // Раскомментируй, чтобы принудительно включить темную тему для формы
          providers={[]} // Массив для соц. провайдеров, если настроишь (напр., ['google', 'github'])
          // Указываем, что перенаправлять никуда не нужно после входа/выхода,
          // так как мы обрабатываем это сами через onAuthStateChange
          redirectTo={undefined}
          localization={{ // Базовая русификация текста кнопок/ссылок
              variables: {
                  sign_in: { email_label: 'Email адрес', password_label: 'Пароль', button_label: "Войти", link_text: "Уже есть аккаунт? Войти" },
                  sign_up: { email_label: 'Email адрес', password_label: 'Пароль', button_label: "Зарегистрироваться", link_text: "Нет аккаунта? Зарегистрироваться"},
                  forgotten_password: { email_label: 'Email адрес', button_label: "Сбросить пароль", link_text: "Забыли пароль?"},
                  // Можно добавить больше переводов по документации @supabase/auth-ui-shared
              }
          }}
          // По умолчанию показывает и вход, и регистрацию. Можно ограничить:
          // view="sign_in" // Показать только форму входа
          // view="sign_up" // Показать только форму регистрации
          // view="forgotten_password" // Показать форму сброса пароля
        />
      </div>
    </div>
  );
}
