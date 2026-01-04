from applicationinsights import TelemetryClient
import os
import logging

logger = logging.getLogger("story-api")

# Initialize Application Insights
APPINSIGHTS_CONN = os.getenv('APPINSIGHTS_CONNECTION_STRING')

if APPINSIGHTS_CONN:
    telemetry_client = TelemetryClient(APPINSIGHTS_CONN)
    logger.info('Application Insights initialized')
else:
    telemetry_client = None
    logger.warning('Application Insights not configured')


class MonitoringService:
    """Monitoring service for Chatbot"""
    
    @staticmethod
    def track_inference(model, prompt_tokens, response_tokens, duration, success=True):
        """Track AI model inference"""
        if not telemetry_client:
            return
        
        try:
            telemetry_client.track_metric(
                'model_inference_duration_ms',
                duration,
                properties={
                    'model': model,
                    'prompt_tokens': str(prompt_tokens),
                    'response_tokens': str(response_tokens),
                    'success': str(success)
                }
            )
        except Exception as e:
            logger.error(f"Error tracking inference: {e}")
    
    @staticmethod
    def track_request(endpoint, status_code, duration, method='POST'):
        """Track HTTP requests"""
        if not telemetry_client:
            return
        
        try:
            success = 200 <= status_code < 300
            
            telemetry_client.track_metric(
                'flask_request_duration_ms',
                duration,
                properties={
                    'endpoint': endpoint,
                    'method': method,
                    'status_code': str(status_code),
                    'success': str(success)
                }
            )
        except Exception as e:
            logger.error(f"Error tracking request: {e}")
    
    @staticmethod
    def track_error(error_type, message, context=None):
        """Track errors and exceptions"""
        if not telemetry_client:
            return
        
        try:
            properties = {
                'error_type': error_type,
                'message': message
            }
            
            if context:
                properties.update(context)
            
            # استخدم logger مباشرة بدلاً من track_trace
            logger.error(f"{error_type}: {message}", extra={'custom_dimensions': properties})
            
            # أو استخدم track_event
            telemetry_client.track_event('Error', properties=properties)
        except Exception as e:
            logger.error(f"Error tracking exception: {e}")
    
    @staticmethod
    def track_event(event_name, properties=None):
        """Track events"""
        if not telemetry_client:
            return
        
        try:
            telemetry_client.track_event(
                event_name,
                properties=properties or {}
            )
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
    
    @staticmethod
    def flush():
        """Flush monitoring data"""
        if telemetry_client:
            try:
                telemetry_client.flush()
                logger.info("Monitoring data flushed")
            except Exception as e:
                logger.error(f"Error flushing telemetry: {e}")


# Export singleton instance
monitoring = MonitoringService()