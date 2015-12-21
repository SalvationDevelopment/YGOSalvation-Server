--Gogogo Aristera & Dexia
function c13790555.initial_effect(c)
	--effect gain
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_BE_MATERIAL)
	e1:SetCondition(c13790555.efcon)
	e1:SetOperation(c13790555.efop)
	c:RegisterEffect(e1)
	--cannot be target
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e2:SetCondition(c13790555.effcon)
	e2:SetTarget(c13790555.target)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e3:SetProperty(EFFECT_FLAG_IGNORE_RANGE+EFFECT_FLAG_IGNORE_IMMUNE)
	e3:SetValue(c13790555.tgvalue)
	c:RegisterEffect(e3)

end
function c13790555.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x59)
end
function c13790555.effcon(e)
	return Duel.IsExistingMatchingCard(c13790555.filter,e:GetHandler():GetControler(),LOCATION_MZONE,0,1,e:GetHandler())
end
function c13790555.target(e,c)
	return c:IsSetCard(0x59) and c:IsType(TYPE_MONSTER)
end
function c13790555.tgvalue(e,re,rp)
	return rp~=e:GetHandlerPlayer()
end


function c13790555.ffilter(c)
	return not c:IsSetCard(0x59)
end
function c13790555.efcon(e,tp,eg,ep,ev,re,r,rp)
	local ec=e:GetHandler():GetReasonCard()
	return not ec:GetMaterial():IsExists(c13790555.ffilter,1,nil) and r==REASON_XYZ
end
function c13790555.efop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_CARD,0,13790555)
	local c=e:GetHandler()
	local rc=c:GetReasonCard()
	local e1=Effect.CreateEffect(rc)
	e1:SetDescription(aux.Stringid(3606728,1))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c13790555.atkcon)
	e1:SetTarget(c13790555.atktg)
	e1:SetOperation(c13790555.atkop)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	rc:RegisterEffect(e1,true)
	if not rc:IsType(TYPE_EFFECT) then
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_CHANGE_TYPE)
		e2:SetValue(TYPE_MONSTER+TYPE_EFFECT+TYPE_XYZ)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		rc:RegisterEffect(e2)
	end
end
function c13790555.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_XYZ
end
function c13790555.atkfilter(c)
	return c:IsAttackPos()
end
function c13790555.atktg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c13790555.atkfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790555.atkfilter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c13790555.atkfilter,tp,0,LOCATION_MZONE,1,1,nil)
end
function c13790555.atkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsAttackPos() and Duel.ChangePosition(tc,POS_FACEUP_DEFENCE,POS_FACEDOWN_DEFENCE,0,0) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_DEFENCE_FINAL)
		e1:SetValue(0)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
	end
end

