"""
monitoring.py
Application Insights monitoring service for Story Backend
"""

import os
import logging

logger = logging.getLogger("story-api")

# Initialize Application Insights
APPINSIGHTS_CONN = os.getenv('APPLICATIONINSIGHTS_CONNECTION_STRING')

# Try to import Application Insights
try:
    from applicationinsights import TelemetryClient
    
    if APPINSIGHTS_CONN:
        telemetry_client = TelemetryClient(APPINSIGHTS_CONN)
        logger.info('✅ Application Insights initialized')
    else:
        telemetry_client = None
        logger.warning('⚠️ APPLICATIONINSIGHTS_CONNECTION_STRING not set')
        
except ImportError:
    telemetry_client = None
    logger.warning('⚠️ applicationinsights package not installed')


class MonitoringService:
    """Monitoring service for Story Backend"""
    
    @staticmethod
    def track_inference(model, prompt_tokens, response_tokens, duration, success=True):
        """Track AI model inference"""
        if not telemetry_client:
            return
        
        try:
            properties = {
                'model': model,
                'prompt_tokens': prompt_tokens,
                'response_tokens': response_tokens,
                'success': success
            }
            
            # Track as custom event
            telemetry_client.track_event(
                'ModelInference',
                properties=properties,
                measurements={'duration_ms': duration}
            )
            
            # Track duration as metric
            telemetry_client.track_metric(
                'model_inference_duration_ms',
                duration,
                properties=properties
            )
            
            logger.debug(f"Tracked inference: {model} in {duration}ms")
            
        except Exception as e:
            logger.error(f"Error tracking inference: {e}")
    
    @staticmethod
    def track_request(endpoint, status_code, duration, method='POST'):
        """Track HTTP requests"""
        if not telemetry_client:
            return
        
        try:
            success = 200 <= status_code < 300
            
            properties = {
                'endpoint': endpoint,
                'method': method,
                'status_code': status_code,
                'success': success
            }
            
            # Track as custom event
            telemetry_client.track_event(
                'HttpRequest',
                properties=properties,
                measurements={'duration_ms': duration}
            )
            
            # Track duration as metric
            telemetry_client.track_metric(
                'http_request_duration_ms',
                duration,
                properties=properties
            )
            
        except Exception as e:
            logger.error(f"Error tracking request: {e}")
    
    @staticmethod
    def track_error(error_type, message, context=None):
        """Track errors and exceptions"""
        if not telemetry_client:
            logger.error(f"{error_type}: {message}")
            return
        
        try:
            properties = {
                'error_type': error_type,
                'message': str(message)
            }
            
            if context:
                properties.update({k: str(v) for k, v in context.items()})
            
            # Track as exception event
            telemetry_client.track_event(
                'Error',
                properties=properties
            )
            
            # Also log it
            logger.error(f"{error_type}: {message}", extra={'custom_dimensions': properties})
            
        except Exception as e:
            logger.error(f"Error tracking exception: {e}")
    
    @staticmethod
    def track_event(event_name, properties=None, measurements=None):
        """Track custom events"""
        if not telemetry_client:
            return
        
        try:
            props = {k: str(v) for k, v in (properties or {}).items()}
            
            telemetry_client.track_event(
                event_name,
                properties=props,
                measurements=measurements
            )
            
            logger.debug(f"Tracked event: {event_name}")
            
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
    
    @staticmethod
    def flush():
        """Flush monitoring data (call before shutdown)"""
        if telemetry_client:
            try:
                telemetry_client.flush()
                logger.info("📤 Monitoring data flushed")
            except Exception as e:
                logger.error(f"Error flushing telemetry: {e}")


# Export singleton instance
monitoring = MonitoringService()