--Dark Tuner - Dark Goddess Witaka
function c11111129.initial_effect(c)
	--synchro summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetValue(c11111129.synlimit)
	c:RegisterEffect(e1)		
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c11111129.spcon)
	e2:SetOperation(c11111129.spop)
	c:RegisterEffect(e2)
	--lvchange
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_LVCHANGE)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCountLimit(1)
	e3:SetTarget(c11111129.lvtg)
	e3:SetOperation(c11111129.lvop)
	c:RegisterEffect(e3)
end
function c11111129.synlimit(e,c)
	if not c then return false end
	return not c:GetOriginalCode()==(95453143 or 11111132 or 11111133 or 11111134 or 11111135 or 11111136 or 11111137) or c:IsSetCard(0x91)
end
function c11111129.spcon(e,c)
	if c==nil then return true end
	return Duel.CheckLPCost(c:GetControler(),1000)
end
function c11111129.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.PayLPCost(tp,1000)
end
function c11111129.lvfilter(c)
	return c:IsFaceup()
end
function c11111129.lvtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c11111129.lvfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c11111129.lvfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c11111129.lvfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,e:GetHandler())
end
function c11111129.lvop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_LEVEL)
		e1:SetValue(tc:GetLevel())
		e1:SetReset(RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e1)
	end	
end