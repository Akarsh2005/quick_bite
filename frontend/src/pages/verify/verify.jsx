import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const VerifyPayment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const response = await axios.post('http://localhost:5001/api/orders/verify', {
                    orderId,
                    success
                });

                if (response.data.success) {
                    if (success === 'true') {
                        toast.success('Payment successful! Order confirmed.');
                    } else {
                        toast.error('Payment failed. Please try again.');
                    }
                } else {
                    toast.error('Payment verification failed.');
                }
            } catch (error) {
                toast.error('Error verifying payment.');
            } finally {
                navigate('/orders');
            }
        };

        if (orderId) {
            verifyPayment();
        } else {
            navigate('/');
        }
    }, [orderId, success, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Verifying payment...</span>
                </div>
                <p className="mt-3">Verifying your payment...</p>
            </div>
        </div>
    );
};

export default VerifyPayment;