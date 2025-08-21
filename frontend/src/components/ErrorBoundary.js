import React from 'react';
import { View, Text, Pressable } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#0D0D2B',
          padding: 20
        }}>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 20,
            textAlign: 'center'
          }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: 16, 
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 24
          }}>
            We're sorry, but something unexpected happened. Please try again or restart the app.
          </Text>
          <Pressable
            onPress={this.handleReset}
            style={{
              backgroundColor: '#FF7A49',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25,
              marginBottom: 20
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Try Again
            </Text>
          </Pressable>
          {__DEV__ && this.state.error && (
            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: 15, 
              borderRadius: 10,
              marginTop: 20,
              maxWidth: '100%'
            }}>
              <Text style={{ color: '#FF6B6B', fontSize: 14, marginBottom: 10 }}>
                Debug Info (Development Only):
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
