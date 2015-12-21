--Hellfire Charon
function c237.initial_effect(c)
	--synchro custom
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SYNCHRO_MATERIAL_CUSTOM)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetTarget(c237.target)
	e1:SetValue(1)
	e1:SetOperation(c237.operation)
	c:RegisterEffect(e1)
	--synchro limit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetValue(c237.synlimit)
	c:RegisterEffect(e2)
	--banished
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(43014054,0))
	e3:SetCategory(CATEGORY_BANISH)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_BE_MATERIAL)
	e3:SetCondition(c237.damcon)
	e3:SetOperation(c237.damop)
	c:RegisterEffect(e3)
end
c237.tuner_filter=aux.FALSE
function c237.filter(c,syncard,tuner,f,lv)
	return c:IsAttribute(ATTRIBUTE_DARK) and c:IsNotTuner() and c:IsCanBeSynchroMaterial(syncard,tuner) and (f==nil or f(c)) and c:GetLevel()==lv
end
-- 

function c237.target(e,syncard,f,minc,maxc)
	if minc>1 then return false end
	local lv=syncard:GetLevel()-e:GetHandler():GetLevel()
	if lv<=0 then return false end
	return Duel.IsExistingMatchingCard(c237.filter,syncard:GetControler(),LOCATION_GRAVE,0,1,nil,syncard,e:GetHandler(),f,lv)
	end

function c237.operation(e,tp,eg,ep,ev,re,r,rp,syncard,f,minc,maxc)
	local lv=syncard:GetLevel()-e:GetHandler():GetLevel()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SMATERIAL)
	local g=Duel.SelectMatchingCard(tp,c237.filter,tp,LOCATION_GRAVE,0,1,1,nil,syncard,e:GetHandler(),f,lv)
	local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetDescription(aux.Stringid(43014054,0))
		e1:SetCategory(CATEGORY_BANISH)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EVENT_BE_MATERIAL)
		e1:SetCondition(c237.damcon)
		e1:SetOperation(c237.damop)
		g:RegisterEffect(e1)
	Duel.SetSynchroMaterial(g)	
end



function c237.synlimit(e,c)
	if not c then return false end
	return not c:IsAttribute(ATTRIBUTE_DARK)
end
	
function c237.damcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsLocation(LOCATION_GRAVE) and r==REASON_SYNCHRO
end


function c237.damop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,c,1,0,0)
	Duel.Remove(c,POS_FACEUP,REASON_EFFECT)
end
