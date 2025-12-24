import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/common';
import {
  LoginScreen,
  DashboardScreen,
  StockScreen,
  CustomersScreen,
  SalesScreen,
  NewSaleScreen,
  SettingsScreen,
  CreditCardsScreen,
  ManageBrandsScreen,
  CategoriesScreen,
  AddProductScreen,
  AddCustomerScreen
} from './components/screens';

const AppContent: React.FC = () => {
  const { view, isAuthenticated, setView } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'stock':
        return <StockScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'sales':
        return <SalesScreen />;
      case 'new-sale':
        return <NewSaleScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'credit-cards':
        return <CreditCardsScreen />;
      case 'manage-brands':
        return <ManageBrandsScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'add-product':
        return <AddProductScreen />;
      case 'add-customer':
        return <AddCustomerScreen />;
      case 'login':
        return <LoginScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav = ['dashboard', 'stock', 'sales', 'customers'].includes(view);

  return (
    <div className="app-container">
      {renderScreen()}
      {showBottomNav && <BottomNav currentView={view} setView={setView} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
