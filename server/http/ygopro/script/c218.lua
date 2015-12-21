--Gold Coins for Cats
function c218.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e1:SetCondition(c218.condition)
	e1:SetOperation(c218.activate)
	c:RegisterEffect(e1)
end

function c218.condition(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetAttacker()
	if tc:IsControler(1-tp) then tc=Duel.GetAttackTarget() end
	if not tc then return false end
	local bc=tc:GetBattleTarget()
	if tc and bc then
		return tc and tc:IsFaceup() and tc:IsRace(RACE_BEAST)
	else return false end
end


function c218.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetAttacker()
	local bc=Duel.GetAttackTarget()
	if tc:IsControler(1-tp) then 
		tc=Duel.GetAttackTarget()
		bc=Duel.GetAttacker()		
	end
	local atk=bc:GetAttack()
	if not tc:IsRelateToBattle() or tc:IsFacedown() then return end
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetValue(atk/2)
		tc:RegisterEffect(e1)
end
