import 'package:flutter/material.dart';
import '../widgets/common_widgets.dart';

class NeuronAuthPage extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final ValueChanged<String> onLoginSuccess;

  const NeuronAuthPage({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
    required this.onLoginSuccess,
  });

  @override
  State<NeuronAuthPage> createState() => _NeuronAuthPageState();
}

class _NeuronAuthPageState extends State<NeuronAuthPage> {
  bool isSignUp = false;
  bool rememberMe = true;
  bool agreeTerms = false;
  bool agreePrivacy = false;
  bool obscurePassword = true;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showNotification(String msg) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleSubmit() {
    if (isSignUp) {
      if (_nameController.text.trim().isEmpty) {
        _showNotification('Please enter your full name');
        return;
      }
      if (_emailController.text.trim().isEmpty) {
        _showNotification('Please enter your email');
        return;
      }
      if (_passwordController.text.trim().isEmpty) {
        _showNotification('Please enter a password');
        return;
      }
      if (!agreeTerms || !agreePrivacy) {
        _showNotification('Please accept the Terms and Privacy Policy');
        return;
      }
      widget.onLoginSuccess(_nameController.text.trim());
    } else {
      if (_emailController.text.trim().isEmpty) {
        _showNotification('Please enter your email address');
        return;
      }
      if (_passwordController.text.trim().isEmpty) {
        _showNotification('Please enter your password');
        return;
      }
      final displayName = _emailController.text.split('@').first;
      widget.onLoginSuccess(displayName.isNotEmpty ? displayName : 'TEAM');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final bgCardColor = isDark ? const Color(0xFF131926) : Colors.white;
    final borderColor = isDark ? const Color(0xFF222B3D) : const Color(0xFFE2E8F0);
    final fieldFillColor = isDark ? const Color(0xFF0F141F) : const Color(0xFFF8FAFC);
    final primaryPurple = const Color(0xFF7C3AED);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F17) : const Color(0xFFF4F6F9),
      body: Stack(
        children: [
          // Top Corner Theme Toggle Button & Switcher
          Positioned(
            top: 24,
            right: 24,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E2638) : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isDark ? 'DARK THEME' : 'LIGHT THEME',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: isDark ? Colors.grey[300] : Colors.grey[700],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                  style: IconButton.styleFrom(
                    backgroundColor: isDark ? const Color(0xFF1F293D) : Colors.white,
                    foregroundColor: isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C3AED),
                    elevation: isDark ? 0 : 2,
                    shadowColor: Colors.black12,
                  ),
                  onPressed: widget.onToggleTheme,
                  icon: Icon(
                    isDark ? Icons.mode_night_outlined : Icons.wb_sunny_outlined,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),

          // Central Login / Register Card
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 38),
                  decoration: BoxDecoration(
                    color: bgCardColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: borderColor, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.45 : 0.06),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Center(child: GlowingBrainIcon(size: 54)),
                      const SizedBox(height: 12),
                      Center(
                        child: Text(
                          'Neuron',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Center(
                        child: Text(
                          'Your Second Brain',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: isDark ? Colors.grey[400] : Colors.grey[500],
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Title & Subtitle
                      Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              isSignUp ? 'Create your account' : 'Welcome back',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : const Color(0xFF1E293B),
                              ),
                            ),
                            if (!isSignUp) ...[
                              const SizedBox(width: 6),
                              const Text('👋', style: TextStyle(fontSize: 18)),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      Center(
                        child: Text(
                          isSignUp
                              ? 'Start your journey with Neuron.'
                              : 'Login to continue to Neuron.',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? Colors.grey[400] : Colors.grey[500],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Form Fields
                      if (isSignUp) ...[
                        _buildInputField(
                          controller: _nameController,
                          hint: 'Full Name',
                          icon: Icons.person_outline_rounded,
                          isDark: isDark,
                          fillColor: fieldFillColor,
                          borderColor: borderColor,
                        ),
                        const SizedBox(height: 14),
                      ],

                      _buildInputField(
                        controller: _emailController,
                        hint: 'Email address',
                        icon: Icons.mail_outline_rounded,
                        keyboardType: TextInputType.emailAddress,
                        isDark: isDark,
                        fillColor: fieldFillColor,
                        borderColor: borderColor,
                      ),
                      const SizedBox(height: 14),

                      _buildInputField(
                        controller: _passwordController,
                        hint: 'Password',
                        icon: Icons.lock_outline_rounded,
                        isPassword: true,
                        obscureText: obscurePassword,
                        onToggleObscure: () {
                          setState(() {
                            obscurePassword = !obscurePassword;
                          });
                        },
                        isDark: isDark,
                        fillColor: fieldFillColor,
                        borderColor: borderColor,
                      ),
                      const SizedBox(height: 12),

                      // Checkboxes / Options
                      if (!isSignUp)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: Checkbox(
                                    value: rememberMe,
                                    activeColor: primaryPurple,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    onChanged: (val) {
                                      setState(() {
                                        rememberMe = val ?? false;
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Remember me',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: isDark ? Colors.grey[300] : Colors.grey[700],
                                  ),
                                ),
                              ],
                            ),
                            InkWell(
                              onTap: () => _showNotification('Password reset email sent!'),
                              child: const Text(
                                'Forgot password?',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF8B5CF6),
                                ),
                              ),
                            ),
                          ],
                        )
                      else ...[
                        _buildTermsCheckbox(
                          label: 'I agree to the Terms of Service',
                          value: agreeTerms,
                          onChanged: (val) => setState(() => agreeTerms = val ?? false),
                          isDark: isDark,
                        ),
                        const SizedBox(height: 6),
                        _buildTermsCheckbox(
                          label: 'I agree to the Privacy Policy',
                          value: agreePrivacy,
                          onChanged: (val) => setState(() => agreePrivacy = val ?? false),
                          isDark: isDark,
                        ),
                      ],
                      const SizedBox(height: 20),

                      // Gradient Submit Button
                      Container(
                        height: 44,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          gradient: const LinearGradient(
                            colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF7C3AED).withValues(alpha: 0.4),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: _handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            isSignUp ? 'Create Account' : 'Login',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),

                      // Divider "or continue with"
                      Row(
                        children: [
                          Expanded(child: Divider(color: borderColor, thickness: 1)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              'or continue with',
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? Colors.grey[500] : Colors.grey[400],
                              ),
                            ),
                          ),
                          Expanded(child: Divider(color: borderColor, thickness: 1)),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Social Buttons
                      _buildSocialButton(
                        text: 'Continue with Google',
                        iconWidget: Image.network(
                          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png',
                          width: 16,
                          height: 16,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.g_mobiledata, color: Colors.red, size: 20),
                        ),
                        onTap: () {
                          _showNotification('Logging in with Google...');
                          widget.onLoginSuccess('TEAM');
                        },
                        isDark: isDark,
                        borderColor: borderColor,
                        fillColor: fieldFillColor,
                      ),
                      const SizedBox(height: 10),
                      _buildSocialButton(
                        text: 'Continue with GitHub',
                        iconWidget: Icon(
                          Icons.code_rounded,
                          size: 18,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        onTap: () {
                          _showNotification('Logging in with GitHub...');
                          widget.onLoginSuccess('TEAM');
                        },
                        isDark: isDark,
                        borderColor: borderColor,
                        fillColor: fieldFillColor,
                      ),
                      const SizedBox(height: 22),

                      // Bottom toggle between Login and Sign Up
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            isSignUp
                                ? 'Already have an account? '
                                : "Don't have an account? ",
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              setState(() {
                                isSignUp = !isSignUp;
                              });
                            },
                            child: Text(
                              isSignUp ? 'Log in' : 'Sign up',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF8B5CF6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggleObscure,
    TextInputType keyboardType = TextInputType.text,
    required bool isDark,
    required Color fillColor,
    required Color borderColor,
  }) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword ? obscureText : false,
        keyboardType: keyboardType,
        style: TextStyle(
          fontSize: 13,
          color: isDark ? Colors.white : Colors.black87,
        ),
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          prefixIcon: Icon(
            icon,
            size: 18,
            color: isDark ? Colors.grey[500] : Colors.grey[400],
          ),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 16,
                    color: isDark ? Colors.grey[500] : Colors.grey[400],
                  ),
                  onPressed: onToggleObscure,
                )
              : null,
          hintText: hint,
          hintStyle: TextStyle(
            color: isDark ? Colors.grey[600] : Colors.grey[400],
            fontSize: 13,
          ),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildTermsCheckbox({
    required String label,
    required bool value,
    required ValueChanged<bool?> onChanged,
    required bool isDark,
  }) {
    return Row(
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: Checkbox(
            value: value,
            activeColor: const Color(0xFF8B5CF6),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            onChanged: onChanged,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? Colors.grey[300] : Colors.grey[700],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSocialButton({
    required String text,
    required Widget iconWidget,
    required VoidCallback onTap,
    required bool isDark,
    required Color borderColor,
    required Color fillColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: fillColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            iconWidget,
            const SizedBox(width: 10),
            Text(
              text,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[200] : Colors.grey[800],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
