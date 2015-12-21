--猫に小判
function c100000182.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_BE_BATTLE_TARGET)
	e1:SetCondition(c100000182.condition)
	e1:SetTarget(c100000182.target)
	e1:SetOperation(c100000182.activate)
	c:RegisterEffect(e1)
end
function c100000182.condition(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	return tc:IsControler(tp) and tc:IsRace(RACE_BEAST)
end
function c100000182.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)	
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return tg:IsOnField() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
end
function c100000182.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	--atk
	local e1=Effect.CreateEffect(Duel.GetAttackTarget())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(tc:GetAttack()/2)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_DAMAGE_CAL+RESET_BATTLE)
	Duel.GetAttackTarget():RegisterEffect(e1)
end
