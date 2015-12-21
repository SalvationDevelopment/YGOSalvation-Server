--暗黒ヴェロキ
function c1037.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetCondition(c1037.condtion)
	e1:SetValue(c1037.val)
	c:RegisterEffect(e1)
end
function c1037.condtion(e)
	local ph=Duel.GetCurrentPhase()
	return ph==PHASE_DAMAGE or ph==PHASE_DAMAGE_CAL
end
function c1037.val(e,c)
	if Duel.GetAttacker()==e:GetHandler() and Duel.GetAttackTarget()~=nil then return 400
	elseif e:GetHandler()==Duel.GetAttackTarget() then return -400
	else return 0 end
end
