--Noble Knight Drystan
function c80500084.initial_effect(c)
	--target
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetCondition(c80500084.condition)
	e1:SetTarget(c80500084.target)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e2:SetValue(c80500084.tgvalue)
	c:RegisterEffect(e2)
	--destroy
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_DESTROY)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_EQUIP)
	e3:SetCondition(c80500084.descon)
	e3:SetCost(c80500084.descost)
	e3:SetTarget(c80500084.destg)
	e3:SetOperation(c80500084.desop)
	c:RegisterEffect(e3)
end
function c80500084.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x107a)
end
function c80500084.condition(e)
	return Duel.IsExistingMatchingCard(c80500084.filter,e:GetHandler():GetControler(),LOCATION_MZONE,0,1,e:GetHandler())
end
function c80500084.tgvalue(e,re,rp)
	return rp~=e:GetHandlerPlayer()
end
function c80500084.target(e,c)
	return c:IsFaceup() and c:GetAttack()<1800 and c~=e:GetHandler()
end
function c80500084.descon(e,tp,eg)
	return eg and eg:IsExists(Card.IsSetCard,1,nil,0x207a)
end
function c80500084.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80500084)==0 end
	Duel.RegisterFlagEffect(tp,80500084,RESET_PHASE+PHASE_END,0,1)
end

function c80500084.desfilter(c)
	return c:IsFaceup() and c:IsDestructable() 
end
function c80500084.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_ONFIELD) 
	and c80500084.desfilter(chkc) end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c80500084.desfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80500084.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end