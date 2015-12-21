--ＥＭジンライノ
function c80400005.initial_effect(c)
	--untargetable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetTarget(c80400005.target)
	e1:SetValue(1)
	c:RegisterEffect(e1)	
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetTarget(c80400005.reptg)
	e2:SetValue(c80400005.repval)
	e2:SetOperation(c80400005.repop)
	c:RegisterEffect(e2)
end
function c80400005.target(e,c)
	return c:IsSetCard(0x9f) and c~=e:GetHandler()
end
function c80400005.repfilter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE) and c:IsSetCard(0x9f)
		and not c:IsCode(80400005)
		and c:IsReason(REASON_EFFECT+REASON_BATTLE)
end
function c80400005.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemove() and eg:IsExists(c80400005.repfilter,1,nil,tp) end
	return Duel.SelectYesNo(tp,aux.Stringid(80400005,0))
end
function c80400005.repval(e,c)
	return c80400005.repfilter(c,e:GetHandlerPlayer())
end
function c80400005.repop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
end