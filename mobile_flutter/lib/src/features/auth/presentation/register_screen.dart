import "dart:ui";

import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../data/philippine_address_service.dart";
import "auth_controller.dart";
import "email_verification_screen.dart";
import "widgets/address_dropdown_field.dart";
import "widgets/auth_components.dart";

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  static const _phoneDigitLimit = 11;

  final _formKey = GlobalKey<FormState>();

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _firstNameFocusNode = FocusNode();
  final _lastNameFocusNode = FocusNode();
  final _emailFocusNode = FocusNode();
  final _phoneFocusNode = FocusNode();
  final _addressFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  final _confirmPasswordFocusNode = FocusNode();

  final _addressService = const PhilippineAddressService();

  String? _selectedProvince;
  String? _selectedCity;
  String? _selectedBarangay;
  String? _selectedPurok;
  final _customPurokController = TextEditingController();
  final _customPurokFocusNode = FocusNode();
  bool _isCustomPurok = false;

  List<String> _provinceOptions = [];
  List<String> _cityOptions = [];
  List<String> _barangayOptions = [];
  List<String> _purokOptions = [];

  bool _isLoadingProvinces = false;
  bool _isLoadingCities = false;
  bool _isLoadingBarangays = false;
  bool _isLoadingPuroks = false;

  String? _firstNameError;
  String? _lastNameError;
  String? _emailError;
  String? _phoneError;
  String? _provinceError;
  String? _cityError;
  String? _barangayError;
  String? _purokError;
  String? _addressError;
  String? _passwordError;
  String? _confirmPasswordError;
  String? _generalError;

  bool _isSubmitting = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _loadProvinces();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _customPurokController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();

    _firstNameFocusNode.dispose();
    _lastNameFocusNode.dispose();
    _emailFocusNode.dispose();
    _phoneFocusNode.dispose();
    _addressFocusNode.dispose();
    _customPurokFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    super.dispose();
  }

  /// Automatically combines all selected address components into one formatted address string.
  String get _formattedAddress {
    final effectivePurok = _isCustomPurok
        ? _customPurokController.text.trim()
        : (_selectedPurok ?? "");
    return PhilippineAddressService.formatAddress(
      province: _selectedProvince,
      city: _selectedCity,
      barangay: _selectedBarangay,
      purok: effectivePurok,
    );
  }

  void _syncCombinedAddress() {
    final combined = _formattedAddress;
    _addressController.text = combined;
    _onAddressChanged(combined);
  }

  Future<void> _loadProvinces() async {
    setState(() => _isLoadingProvinces = true);
    try {
      final provinces = await _addressService.getProvinces();
      if (!mounted) return;
      setState(() {
        _provinceOptions = provinces;
        _isLoadingProvinces = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingProvinces = false);
    }
  }

  Future<void> _onProvinceChanged(String? province) async {
    if (_generalError != null) setState(() => _generalError = null);
    setState(() {
      _selectedProvince = province;
      _selectedCity = null;
      _selectedBarangay = null;
      _selectedPurok = null;
      _isCustomPurok = false;
      _customPurokController.clear();
      _cityOptions = [];
      _barangayOptions = [];
      _purokOptions = [];
      _provinceError = null;
      _cityError = null;
      _barangayError = null;
      _purokError = null;
      _addressError = null;
    });
    _syncCombinedAddress();
    if (province == null) return;
    setState(() => _isLoadingCities = true);
    try {
      final cities = await _addressService.getCities(province);
      if (!mounted) return;
      setState(() {
        _cityOptions = cities;
        _isLoadingCities = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingCities = false);
    }
  }

  Future<void> _onCityChanged(String? city) async {
    if (_generalError != null) setState(() => _generalError = null);
    setState(() {
      _selectedCity = city;
      _selectedBarangay = null;
      _selectedPurok = null;
      _isCustomPurok = false;
      _customPurokController.clear();
      _barangayOptions = [];
      _purokOptions = [];
      _cityError = null;
      _barangayError = null;
      _purokError = null;
      _addressError = null;
    });
    _syncCombinedAddress();
    if (city == null || _selectedProvince == null) return;
    setState(() => _isLoadingBarangays = true);
    try {
      final barangays =
          await _addressService.getBarangays(_selectedProvince!, city);
      if (!mounted) return;
      setState(() {
        _barangayOptions = barangays;
        _isLoadingBarangays = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingBarangays = false);
    }
  }

  Future<void> _onBarangayChanged(String? barangay) async {
    if (_generalError != null) setState(() => _generalError = null);
    setState(() {
      _selectedBarangay = barangay;
      _selectedPurok = null;
      _isCustomPurok = false;
      _customPurokController.clear();
      _purokOptions = [];
      _barangayError = null;
      _purokError = null;
      _addressError = null;
    });
    _syncCombinedAddress();
    if (barangay == null ||
        _selectedProvince == null ||
        _selectedCity == null) {
      return;
    }
    setState(() => _isLoadingPuroks = true);
    try {
      final puroks = await _addressService.getPuroks(
        _selectedProvince!,
        _selectedCity!,
        barangay,
      );
      if (!mounted) return;
      setState(() {
        _purokOptions = puroks;
        _isLoadingPuroks = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingPuroks = false);
    }
  }

  void _onPurokChanged(String? purok) {
    if (_generalError != null) setState(() => _generalError = null);
    setState(() {
      _selectedPurok = purok;
      _purokError = null;
      _addressError = null;
      if (purok == PhilippineAddressService.otherOption) {
        _isCustomPurok = true;
      } else {
        _isCustomPurok = false;
        _customPurokController.clear();
      }
    });
    _syncCombinedAddress();
    if (_isCustomPurok) {
      _customPurokFocusNode.requestFocus();
    }
  }

  void _onCustomPurokChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_purokError != null && val.trim().isNotEmpty) {
      setState(() => _purokError = null);
    }
    _syncCombinedAddress();
  }

  static final _emailRegex = RegExp(r"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");

  // ---------------------------------------------------------------------------
  // Validation Rules
  // ---------------------------------------------------------------------------
  String? _validateFirstName(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return "First name is required.";
    }
    if (trimmed.length < 2) {
      return "First name must be at least 2 characters.";
    }
    return null;
  }

  String? _validateLastName(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return "Last name is required.";
    }
    if (trimmed.length < 2) {
      return "Last name must be at least 2 characters.";
    }
    return null;
  }

  String? _validateEmail(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return "Email address is required.";
    }
    if (!_emailRegex.hasMatch(trimmed)) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    return null;
  }

  String? _validatePhone(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null; // Phone is optional
    if (trimmed.length > _phoneDigitLimit || RegExp(r"[^0-9]").hasMatch(trimmed)) {
      return "Phone number must contain up to $_phoneDigitLimit digits.";
    }
    if (trimmed.length < 7) {
      return "Please enter a valid phone number (at least 7 digits).";
    }
    return null;
  }

  String? _validateAddress(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return "Residential address is required.";
    }
    if (trimmed.length < 5) {
      return "Please enter a complete address (e.g. Street, Barangay, City).";
    }
    return null;
  }

  String? _validatePassword(String value) {
    if (value.isEmpty) {
      return "Password is required.";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return null;
  }

  String? _validateConfirmPassword(String value, String originalPassword) {
    if (value.isEmpty) {
      return "Please confirm your password.";
    }
    if (value != originalPassword) {
      return "Passwords do not match.";
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Password Strength Calculation
  // ---------------------------------------------------------------------------
  int _calculatePasswordStrength(String password) {
    if (password.isEmpty) return 0;
    int score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (RegExp(r"[0-9]").hasMatch(password) &&
        RegExp(r"[a-zA-Z]").hasMatch(password)) {
      score++;
    }
    if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password) ||
        (RegExp(r"[A-Z]").hasMatch(password) &&
            RegExp(r"[a-z]").hasMatch(password))) {
      score++;
    }
    return score;
  }

  String _getPasswordStrengthLabel(int score) {
    switch (score) {
      case 1:
        return "Weak (Add numbers or more characters)";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "Minimum 6 characters";
    }
  }

  Color _getPasswordStrengthColor(int score) {
    switch (score) {
      case 1:
        return AppColors.destructive;
      case 2:
        return AppColors.warning;
      case 3:
        return AppColors.info;
      case 4:
        return AppColors.success;
      default:
        return AppColors.border;
    }
  }

  // ---------------------------------------------------------------------------
  // Clear Errors on Correction
  // ---------------------------------------------------------------------------
  void _onFirstNameChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_firstNameError != null) {
      final err = _validateFirstName(val);
      if (err == null || err != _firstNameError) {
        setState(() => _firstNameError = err);
      }
    }
  }

  void _onLastNameChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_lastNameError != null) {
      final err = _validateLastName(val);
      if (err == null || err != _lastNameError) {
        setState(() => _lastNameError = err);
      }
    }
  }

  void _onEmailChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_emailError != null) {
      final err = _validateEmail(val);
      if (err == null || err != _emailError) {
        setState(() => _emailError = err);
      }
    }
  }

  void _onPhoneChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_phoneError != null) {
      final err = _validatePhone(val);
      if (err == null || err != _phoneError) {
        setState(() => _phoneError = err);
      }
    }
  }

  void _onAddressChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_addressError != null) {
      final err = _validateAddress(val);
      if (err == null || err != _addressError) {
        setState(() => _addressError = err);
      }
    }
  }

  void _onPasswordChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    setState(() {}); // Updates strength bar
    if (_passwordError != null) {
      final err = _validatePassword(val);
      if (err == null || err != _passwordError) {
        setState(() => _passwordError = err);
      }
    }
    // Also revalidate confirm password if it already has input
    if (_confirmPasswordController.text.isNotEmpty &&
        _confirmPasswordError != null) {
      setState(() {
        _confirmPasswordError =
            _validateConfirmPassword(_confirmPasswordController.text, val);
      });
    }
  }

  void _onConfirmPasswordChanged(String val) {
    if (_generalError != null) setState(() => _generalError = null);
    if (_confirmPasswordError != null) {
      final err = _validateConfirmPassword(val, _passwordController.text);
      if (err == null || err != _confirmPasswordError) {
        setState(() => _confirmPasswordError = err);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Form Submission
  // ---------------------------------------------------------------------------
  Future<void> _handleRegister() async {
    FocusScope.of(context).unfocus();

    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final address = _formattedAddress;
    _addressController.text = address;
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    final firstNameError = _validateFirstName(firstName);
    final lastNameError = _validateLastName(lastName);
    final emailError = _validateEmail(email);
    final phoneError = _validatePhone(phone);

    final provinceError = (_selectedProvince == null ||
            _selectedProvince!.trim().isEmpty)
        ? "Province is required."
        : null;
    final cityError =
        (_selectedCity == null || _selectedCity!.trim().isEmpty)
            ? "City / Municipality is required."
            : null;
    final barangayError = (_selectedBarangay == null ||
            _selectedBarangay!.trim().isEmpty)
        ? "Barangay is required."
        : null;
    final purokError = _isCustomPurok
        ? (_customPurokController.text.trim().isEmpty
            ? "Please specify your Purok / Sitio."
            : null)
        : ((_selectedPurok == null || _selectedPurok!.trim().isEmpty)
            ? "Purok / Sitio is required."
            : null);

    final addressError = provinceError ??
        cityError ??
        barangayError ??
        purokError ??
        _validateAddress(address);
    final passwordError = _validatePassword(password);
    final confirmPasswordError =
        _validateConfirmPassword(confirmPassword, password);

    final hasErrors = firstNameError != null ||
        lastNameError != null ||
        emailError != null ||
        phoneError != null ||
        provinceError != null ||
        cityError != null ||
        barangayError != null ||
        purokError != null ||
        addressError != null ||
        passwordError != null ||
        confirmPasswordError != null;

    if (hasErrors) {
      setState(() {
        _firstNameError = firstNameError;
        _lastNameError = lastNameError;
        _emailError = emailError;
        _phoneError = phoneError;
        _provinceError = provinceError;
        _cityError = cityError;
        _barangayError = barangayError;
        _purokError = purokError;
        _addressError = addressError;
        _passwordError = passwordError;
        _confirmPasswordError = confirmPasswordError;
        _generalError = null;
      });

      // Autofocus first invalid input
      if (firstNameError != null) {
        _firstNameFocusNode.requestFocus();
      } else if (lastNameError != null) {
        _lastNameFocusNode.requestFocus();
      } else if (emailError != null) {
        _emailFocusNode.requestFocus();
      } else if (phoneError != null) {
        _phoneFocusNode.requestFocus();
      } else if (purokError != null && _isCustomPurok) {
        _customPurokFocusNode.requestFocus();
      } else if (passwordError != null) {
        _passwordFocusNode.requestFocus();
      } else if (confirmPasswordError != null) {
        _confirmPasswordFocusNode.requestFocus();
      }
      return;
    }

    setState(() {
      _isSubmitting = true;
      _firstNameError = null;
      _lastNameError = null;
      _emailError = null;
      _phoneError = null;
      _provinceError = null;
      _cityError = null;
      _barangayError = null;
      _purokError = null;
      _addressError = null;
      _passwordError = null;
      _confirmPasswordError = null;
      _generalError = null;
    });

    try {
      await ref.read(authControllerProvider.notifier).register(
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone.isEmpty ? null : phone,
            address: address,
            password: password,
          );

      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => EmailVerificationScreen(email: email),
          ),
        );
      }
    } catch (error) {
      if (!mounted) return;

      final rawError = error.toString().toLowerCase();
      String friendlyMessage =
          "Registration failed. Please check your details.";

      if (rawError.contains("already registered") ||
          rawError.contains("already exists") ||
          rawError.contains("unique")) {
        setState(() {
          _emailError = "This email is already registered.";
        });
        friendlyMessage =
            "This email address is already registered. Please sign in instead.";
      } else if (rawError.contains("network") ||
          rawError.contains("connection") ||
          rawError.contains("socket")) {
        friendlyMessage =
            "Unable to connect to the server. Please check your connection.";
      } else {
        friendlyMessage = error.toString().replaceAll("Exception: ", "").trim();
      }

      setState(() {
        _generalError = friendlyMessage;
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final passwordStrength =
        _calculatePasswordStrength(_passwordController.text);
    final passwordStrengthColor = _getPasswordStrengthColor(passwordStrength);
    final passwordStrengthLabel = _getPasswordStrengthLabel(passwordStrength);

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: AnimatedGradientBackground(
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Back Button Header
                      FadeInSlide(
                        duration: const Duration(milliseconds: 400),
                        child: Row(
                          children: [
                            InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: _isSubmitting
                                  ? null
                                  : () => Navigator.of(context).pop(),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.card.withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color:
                                        AppColors.border.withValues(alpha: 0.6),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.foreground
                                          .withValues(alpha: 0.04),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.arrow_back_rounded,
                                  size: 20,
                                  color: AppColors.foreground,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),

                      // Logo Avatar
                      FadeInSlide(
                        duration: const Duration(milliseconds: 600),
                        child: Center(
                          child: Hero(
                            tag: "app_logo",
                            child: Container(
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.card,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary
                                        .withValues(alpha: 0.15),
                                    blurRadius: 26,
                                    offset: const Offset(0, 12),
                                  ),
                                ],
                                border: Border.all(
                                  color: AppColors.background
                                      .withValues(alpha: 0.6),
                                  width: 2,
                                ),
                              ),
                              child: Image.asset(
                                "assets/images/logo-final.png",
                                height: 58,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Glassmorphism Card
                      FadeInSlide(
                        delay: const Duration(milliseconds: 150),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(30),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.card.withValues(alpha: 0.8),
                                borderRadius: BorderRadius.circular(30),
                                border: Border.all(
                                  color: AppColors.background
                                      .withValues(alpha: 0.6),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.foreground
                                        .withValues(alpha: 0.04),
                                    blurRadius: 24,
                                    offset: const Offset(0, 12),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(AppSpacing.xl),
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.stretch,
                                children: [
                                  Text(
                                    "Create Account",
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineSmall
                                        ?.copyWith(
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.5,
                                          fontSize: 24,
                                          color: AppColors.foreground,
                                        ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    "Join BlueWaste to submit and monitor waste reports.",
                                    style: TextStyle(
                                      color: AppColors.mutedForeground,
                                      fontWeight: FontWeight.w500,
                                      fontSize: 13,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: AppSpacing.lg),

                                  // General Server Error Banner
                                  if (_generalError != null) ...[
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 10,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.tint(
                                          AppColors.destructive,
                                          opacity: 0.1,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(12),
                                        border: Border.all(
                                          color: AppColors.destructive
                                              .withValues(alpha: 0.25),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.error_outline_rounded,
                                            size: 18,
                                            color: AppColors.destructive,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              _generalError!,
                                              style: const TextStyle(
                                                fontSize: 12.5,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.destructive,
                                                height: 1.3,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: AppSpacing.md),
                                  ],

                                  // First Name
                                  PremiumTextField(
                                    controller: _firstNameController,
                                    focusNode: _firstNameFocusNode,
                                    labelText: "First Name",
                                    hintText: "Enter your first name",
                                    prefixIcon: Icons.person_rounded,
                                    textCapitalization:
                                        TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    errorText: _firstNameError,
                                    onChanged: _onFirstNameChanged,
                                    onSubmitted: (_) {
                                      _lastNameFocusNode.requestFocus();
                                    },
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Last Name
                                  PremiumTextField(
                                    controller: _lastNameController,
                                    focusNode: _lastNameFocusNode,
                                    labelText: "Last Name",
                                    hintText: "Enter your last name",
                                    prefixIcon: Icons.badge_rounded,
                                    textCapitalization:
                                        TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    errorText: _lastNameError,
                                    onChanged: _onLastNameChanged,
                                    onSubmitted: (_) {
                                      _emailFocusNode.requestFocus();
                                    },
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Email Address
                                  PremiumTextField(
                                    controller: _emailController,
                                    focusNode: _emailFocusNode,
                                    labelText: "Email address",
                                    hintText: "Enter your email",
                                    prefixIcon: Icons.email_rounded,
                                    keyboardType:
                                        TextInputType.emailAddress,
                                    textInputAction: TextInputAction.next,
                                    errorText: _emailError,
                                    onChanged: _onEmailChanged,
                                    onSubmitted: (_) {
                                      _phoneFocusNode.requestFocus();
                                    },
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Phone Number (Optional)
                                  PremiumTextField(
                                    controller: _phoneController,
                                    focusNode: _phoneFocusNode,
                                    labelText: "Phone Number (optional)",
                                    hintText: "e.g. 09123456789",
                                    prefixIcon: Icons.phone_rounded,
                                    keyboardType: TextInputType.phone,
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                      LengthLimitingTextInputFormatter(
                                        _phoneDigitLimit,
                                      ),
                                    ],
                                    textInputAction: TextInputAction.next,
                                    errorText: _phoneError,
                                    onChanged: _onPhoneChanged,
                                    onSubmitted: (_) {
                                      _addressFocusNode.requestFocus();
                                    },
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Cascading Address Dropdowns: Province, City/Municipality, Barangay, Purok/Sitio
                                  AddressDropdownField(
                                    labelText: "Province",
                                    hintText: "Select Province",
                                    prefixIcon: Icons.map_rounded,
                                    value: _selectedProvince,
                                    items: _provinceOptions,
                                    isLoading: _isLoadingProvinces,
                                    onChanged: _onProvinceChanged,
                                    errorText: _provinceError,
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  AddressDropdownField(
                                    labelText: "City / Municipality",
                                    hintText: _selectedProvince == null
                                        ? "Select province first"
                                        : "Select City / Municipality",
                                    prefixIcon: Icons.location_city_rounded,
                                    value: _selectedCity,
                                    items: _cityOptions,
                                    isLoading: _isLoadingCities,
                                    enabled: _selectedProvince != null,
                                    onChanged: _onCityChanged,
                                    errorText: _cityError,
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  AddressDropdownField(
                                    labelText: "Barangay",
                                    hintText: _selectedCity == null
                                        ? "Select city first"
                                        : "Select Barangay",
                                    prefixIcon: Icons.holiday_village_rounded,
                                    value: _selectedBarangay,
                                    items: _barangayOptions,
                                    isLoading: _isLoadingBarangays,
                                    enabled: _selectedCity != null,
                                    onChanged: _onBarangayChanged,
                                    errorText: _barangayError,
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  AddressDropdownField(
                                    labelText: "Purok / Sitio",
                                    hintText: _selectedBarangay == null
                                        ? "Select barangay first"
                                        : "Select Purok / Sitio",
                                    prefixIcon: Icons.signpost_rounded,
                                    value: _selectedPurok,
                                    items: _purokOptions,
                                    isLoading: _isLoadingPuroks,
                                    enabled: _selectedBarangay != null,
                                    onChanged: _onPurokChanged,
                                    errorText: _purokError,
                                  ),

                                  if (_isCustomPurok) ...[
                                    const SizedBox(height: AppSpacing.md),
                                    PremiumTextField(
                                      controller: _customPurokController,
                                      focusNode: _customPurokFocusNode,
                                      labelText: "Specify Purok / Sitio",
                                      hintText:
                                          "e.g. Purok 5A, Sitio Riverside",
                                      prefixIcon:
                                          Icons.edit_location_alt_rounded,
                                      textCapitalization:
                                          TextCapitalization.words,
                                      textInputAction: TextInputAction.next,
                                      errorText: _purokError,
                                      onChanged: _onCustomPurokChanged,
                                      onSubmitted: (_) {
                                        _passwordFocusNode.requestFocus();
                                      },
                                    ),
                                  ],
                                  const SizedBox(height: AppSpacing.md),

                                  // Password Field
                                  PremiumTextField(
                                    controller: _passwordController,
                                    focusNode: _passwordFocusNode,
                                    labelText: "Password",
                                    hintText: "Create a password",
                                    prefixIcon: Icons.lock_rounded,
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.next,
                                    errorText: _passwordError,
                                    onChanged: _onPasswordChanged,
                                    onSubmitted: (_) {
                                      _confirmPasswordFocusNode
                                          .requestFocus();
                                    },
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword
                                            ? Icons.visibility_off_rounded
                                            : Icons.visibility_rounded,
                                        color: AppColors.mutedForeground,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscurePassword =
                                              !_obscurePassword;
                                        });
                                      },
                                    ),
                                  ),

                                  // Real-time Password Strength Meter
                                  if (_passwordController.text.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 4),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              for (int i = 1; i <= 4; i++)
                                                Expanded(
                                                  child: Container(
                                                    height: 3.5,
                                                    margin: EdgeInsets.only(
                                                        right: i < 4 ? 4 : 0),
                                                    decoration: BoxDecoration(
                                                      color: i <=
                                                              passwordStrength
                                                          ? passwordStrengthColor
                                                          : AppColors.border,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              2),
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment
                                                    .spaceBetween,
                                            children: [
                                              Text(
                                                "Strength: $passwordStrengthLabel",
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                  color:
                                                      passwordStrengthColor,
                                                ),
                                              ),
                                              const Text(
                                                "Min 6 chars",
                                                style: TextStyle(
                                                  fontSize: 10.5,
                                                  color: AppColors
                                                      .mutedForeground,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],

                                  const SizedBox(height: AppSpacing.md),

                                  // Confirm Password Field
                                  PremiumTextField(
                                    controller: _confirmPasswordController,
                                    focusNode: _confirmPasswordFocusNode,
                                    labelText: "Confirm Password",
                                    hintText: "Re-enter your password",
                                    prefixIcon:
                                        Icons.verified_user_rounded,
                                    obscureText: _obscureConfirmPassword,
                                    textInputAction: TextInputAction.done,
                                    errorText: _confirmPasswordError,
                                    onChanged: _onConfirmPasswordChanged,
                                    onSubmitted: (_) => _handleRegister(),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureConfirmPassword
                                            ? Icons.visibility_off_rounded
                                            : Icons.visibility_rounded,
                                        color: AppColors.mutedForeground,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscureConfirmPassword =
                                              !_obscureConfirmPassword;
                                        });
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xl),

                                  // Submit Button
                                  PremiumButton(
                                    onPressed: _isSubmitting
                                        ? null
                                        : _handleRegister,
                                    isLoading: _isSubmitting,
                                    text: "Create Account",
                                  ),
                                  const SizedBox(height: AppSpacing.xl),

                                  // Already have an account row
                                  Wrap(
                                    alignment: WrapAlignment.center,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    children: [
                                      Text(
                                        "Already have an account?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                              color: AppColors.mutedForeground,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13.5,
                                            ),
                                      ),
                                      const SizedBox(width: AppSpacing.xs),
                                      InkWell(
                                        borderRadius:
                                            BorderRadius.circular(6),
                                        onTap: _isSubmitting
                                            ? null
                                            : () {
                                                Navigator.of(context).pop();
                                              },
                                        child: const Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 4,
                                            vertical: 2,
                                          ),
                                          child: Text(
                                            "Sign in",
                                            style: TextStyle(
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.primary,
                                              fontSize: 13.5,
                                            ),
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
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
