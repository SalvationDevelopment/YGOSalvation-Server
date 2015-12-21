--Majespecter Sonic
function c13790661.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_DEFCHANGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_DAMAGE_STEP)
	e1:SetCondition(c13790661.condition)
	e1:SetTarget(c13790661.target)
	e1:SetOperation(c13790661.activate)
	c:RegisterEffect(e1)
end
function c13790661.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()~=PHASE_DAMAGE or not Duel.IsDamageCalculated()
end
function c13790661.filter(c)
	return c:IsFaceup() and c:IsSetCard(0xd0)
end
function c13790661.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c13790661.filter(chkc) end
	local exc=nil
	if Duel.GetCurrentPhase()==PHASE_DAMAGE and Duel.GetAttackTarget()==nil then exc=Duel.GetAttacker() end
	if chk==0 then return Duel.IsExistingTarget(c13790661.filter,tp,LOCATION_MZONE,0,1,exc) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c13790661.filter,tp,LOCATION_MZONE,0,1,1,exc)
end
function c13790661.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK_FINAL)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		e1:SetValue(tc:GetAttack()*2)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_SET_DEFENCE_FINAL)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		e2:SetValue(tc:GetDefence()*2)
		tc:RegisterEffect(e2)
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EVENT_PRE_BATTLE_DAMAGE)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		e3:SetCondition(c13790661.rdcon)
		e3:SetOperation(c13790661.rdop)
		tc:RegisterEffect(e3)
	end
end

function c13790661.rdcon(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp
end
function c13790661.rdop(e,tp,eg,ep,ev,re,r,rp)
	Duel.ChangeBattleDamage(ep,ev/2)
end
